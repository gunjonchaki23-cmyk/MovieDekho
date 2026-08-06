import os
import sys
import json
import glob
import time
import requests
import subprocess
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import gspread

# Environment Variables
GDRIVE_CREDENTIALS_JSON = os.environ.get("GDRIVE_CREDENTIALS")
GOOGLE_SHEET_ID = os.environ.get("GOOGLE_SHEET_ID")
GDRIVE_FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID", "")

# Scopes for Google Drive & Sheets API
SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
]

def init_services():
    if not GDRIVE_CREDENTIALS_JSON:
        print("❌ Error: GDRIVE_CREDENTIALS environment variable is missing.")
        sys.exit(1)
        
    creds_dict = json.loads(GDRIVE_CREDENTIALS_JSON)
    creds = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    
    drive_service = build('drive', 'v3', credentials=creds)
    gc = gspread.authorize(creds)
    
    return drive_service, gc

def search_yts_torrent(title, tmdb_id=""):
    print(f"🔍 Searching torrent for: {title} (TMDB ID: {tmdb_id})")
    
    # Try searching YTS by title
    search_url = f"https://yts.mx/api/v2/list_movies.json?query_term={title}&limit=5"
    try:
        res = requests.get(search_url, timeout=10)
        data = res.json()
        
        if data.get('status') == 'ok' and data.get('data', {}).get('movie_count', 0) > 0:
            movies = data['data']['movies']
            for m in movies:
                torrents = m.get('torrents', [])
                if torrents:
                    # Prefer 720p or 1080p web/bluray
                    selected = torrents[0]
                    for t in torrents:
                        if t.get('quality') in ['720p', '1080p']:
                            selected = t
                            break
                    print(f"✅ Found YTS torrent: {m['title']} ({selected['quality']})")
                    return selected['url'], f"{m['title']}_{selected['quality']}.mp4"
    except Exception as e:
        print(f"⚠️ YTS Search failed: {e}")
        
    return None, None

def download_torrent(torrent_url):
    print("⏳ Starting torrent download with aria2c...")
    download_dir = "./downloads"
    os.makedirs(download_dir, exist_ok=True)
    
    cmd = [
        "aria2c",
        "--seed-time=0",
        "--max-download-limit=0",
        "--summary-interval=5",
        "-d", download_dir,
        torrent_url
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"❌ Download failed: {res.stderr}")
        return None
        
    # Find largest video file in download_dir
    video_extensions = ('*.mp4', '*.mkv', '*.avi', '*.webm')
    files = []
    for ext in video_extensions:
        files.extend(glob.glob(os.path.join(download_dir, '**', ext), recursive=True))
        
    if not files:
        print("❌ No video files found in downloaded torrent.")
        return None
        
    # Pick largest file
    largest_file = max(files, key=os.path.getsize)
    print(f"✅ Download complete: {os.path.basename(largest_file)} ({round(os.path.getsize(largest_file)/(1024*1024), 2)} MB)")
    return largest_file

def upload_to_gdrive(drive_service, file_path, folder_id=""):
    file_name = os.path.basename(file_path)
    print(f"☁️ Uploading {file_name} to Google Drive...")
    
    file_metadata = {'name': file_name}
    if folder_id:
        file_metadata['parents'] = [folder_id]
        
    media = MediaFileUpload(file_path, resumable=True)
    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, webViewLink, webContentLink'
    ).execute()
    
    file_id = file.get('id')
    print(f"✅ Uploaded to Google Drive. File ID: {file_id}")
    
    # Make file public ("Anyone with link can view")
    drive_service.permissions().create(
        fileId=file_id,
        body={'type': 'anyone', 'role': 'reader'}
    ).execute()
    
    direct_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    return direct_link

def process_sheet_requests():
    if not GOOGLE_SHEET_ID:
        print("❌ Error: GOOGLE_SHEET_ID environment variable is missing.")
        sys.exit(1)
        
    drive_service, gc = init_services()
    
    try:
        doc = gc.open_by_key(GOOGLE_SHEET_ID)
        sheet = doc.sheet1
    except Exception as e:
        print(f"❌ Failed to open Google Sheet: {e}")
        sys.exit(1)
        
    records = sheet.get_all_values()
    if not records or len(records) <= 1:
        print("ℹ️ No rows found in Google Sheet.")
        return

    header = records[0]
    print(f"📊 Sheet headers: {header}")
    
    # Process unfulfilled rows (where Column 1 has ID, Column 4 is empty)
    for idx, row in enumerate(records[1:], start=2):  # 1-indexed row number in gspread
        tmdb_id = row[0].strip() if len(row) > 0 else ""
        movie_type = row[1].strip() if len(row) > 1 else "Movie"
        title = row[2].strip() if len(row) > 2 else ""
        drive_link = row[3].strip() if len(row) > 3 else ""
        
        if tmdb_id and not drive_link:
            print(f"\n🎯 Processing Row {idx}: {title} (ID: {tmdb_id})")
            
            torrent_url, filename = search_yts_torrent(title, tmdb_id)
            if not torrent_url:
                print(f"⏩ Skipping {title}: No torrent found.")
                continue
                
            local_file = download_torrent(torrent_url)
            if not local_file:
                continue
                
            gdrive_url = upload_to_gdrive(drive_service, local_file, GDRIVE_FOLDER_ID)
            
            # Update Column D (4th column) with Google Drive Link
            sheet.update_cell(idx, 4, gdrive_url)
            print(f"🎉 Updated Sheet Row {idx} with link: {gdrive_url}")
            
            # Clean up local file
            try:
                os.remove(local_file)
            except:
                pass
                
            # Process 1 movie per run to avoid timeout limits
            break

if __name__ == "__main__":
    process_sheet_requests()
