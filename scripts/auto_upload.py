import os
import sys
import json
import glob
import time
import re
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
TMDB_API_KEY = "84128f7311124fa4b04618e47614d97a"

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

def get_imdb_id_from_tmdb(tmdb_id, movie_type="movie"):
    endpoint = "tv" if "tv" in movie_type.lower() else "movie"
    url = f"https://api.themoviedb.org/3/{endpoint}/{tmdb_id}/external_ids?api_key={TMDB_API_KEY}"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json().get("imdb_id")
    except Exception as e:
        print(f"⚠️ Could not fetch IMDB ID from TMDB: {e}")
    return None

def search_eztv_torrent(imdb_id):
    if not imdb_id:
        return None, None
    clean_imdb = imdb_id.replace("tt", "")
    url = f"https://eztv.re/api/get-torrents?imdb_id={clean_imdb}&limit=5"
    try:
        res = requests.get(url, timeout=10)
        data = res.json()
        torrents = data.get('torrents', [])
        if torrents:
            t = torrents[0]
            download_url = t.get('torrent_url') or t.get('magnet_url')
            filename = f"{t.get('title', 'tv_show')}.torrent"
            print(f"✅ Found EZTV Torrent: {t.get('title')}")
            return download_url, filename
    except Exception as e:
        print(f"⚠️ EZTV search failed: {e}")
    return None, None

def search_yts_torrent(title, tmdb_id="", movie_type="movie"):
    print(f"\n🔍 Searching torrent for: '{title}' (TMDB ID: {tmdb_id}, Type: {movie_type})")
    
    imdb_id = get_imdb_id_from_tmdb(tmdb_id, movie_type) if tmdb_id else None
    
    # If TV Show, try EZTV first
    if "tv" in movie_type.lower():
        if imdb_id:
            url, name = search_eztv_torrent(imdb_id)
            if url:
                return url, name
        print(f"⏩ Skipping TV Show '{title}': Not found on TV trackers.")
        return None, None

    # Movie search strategy 1: IMDB ID on YTS
    if imdb_id:
        print(f"📌 Found IMDB ID: {imdb_id}. Searching YTS...")
        search_url = f"https://yts.mx/api/v2/list_movies.json?query_term={imdb_id}"
        try:
            res = requests.get(search_url, timeout=10)
            data = res.json()
            if data.get('status') == 'ok' and data.get('data', {}).get('movie_count', 0) > 0:
                m = data['data']['movies'][0]
                torrents = m.get('torrents', [])
                if torrents:
                    selected = torrents[0]
                    for t in torrents:
                        if t.get('quality') in ['720p', '1080p']:
                            selected = t
                            break
                    print(f"✅ Found YTS Torrent via IMDB ID: {m['title']} ({selected['quality']})")
                    return selected['url'], f"{m['title']}_{selected['quality']}.mp4"
        except Exception as e:
            print(f"⚠️ YTS Search by IMDB ID failed: {e}")

    # Movie search strategy 2: Clean Title Search on YTS
    clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', title).strip()
    search_url = f"https://yts.mx/api/v2/list_movies.json?query_term={clean_title}&limit=5"
    try:
        res = requests.get(search_url, timeout=10)
        data = res.json()
        if data.get('status') == 'ok' and data.get('data', {}).get('movie_count', 0) > 0:
            movies = data['data']['movies']
            for m in movies:
                torrents = m.get('torrents', [])
                if torrents:
                    selected = torrents[0]
                    for t in torrents:
                        if t.get('quality') in ['720p', '1080p']:
                            selected = t
                            break
                    print(f"✅ Found YTS Torrent via Clean Title: {m['title']} ({selected['quality']})")
                    return selected['url'], f"{m['title']}_{selected['quality']}.mp4"
    except Exception as e:
        print(f"⚠️ YTS Clean Title Search failed: {e}")
        
    print(f"⏩ Skipping '{title}': Torrent not released yet or unavailable on YTS.")
    return None, None

def download_torrent(torrent_url):
    print("⏳ Starting download with aria2c...")
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
        
    video_extensions = ('*.mp4', '*.mkv', '*.avi', '*.webm')
    files = []
    for ext in video_extensions:
        files.extend(glob.glob(os.path.join(download_dir, '**', ext), recursive=True))
        
    if not files:
        print("❌ No video files found in downloaded torrent.")
        return None
        
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

    print(f"📊 Total Rows in Sheet: {len(records)}")
    
    uploaded_count = 0
    for idx, row in enumerate(records[1:], start=2):
        tmdb_id = row[0].strip() if len(row) > 0 else ""
        movie_type = row[1].strip() if len(row) > 1 else "Movie"
        title = row[2].strip() if len(row) > 2 else ""
        drive_link = row[3].strip() if len(row) > 3 else ""
        
        if tmdb_id and not drive_link:
            torrent_url, filename = search_yts_torrent(title, tmdb_id, movie_type)
            if not torrent_url:
                continue
                
            local_file = download_torrent(torrent_url)
            if not local_file:
                continue
                
            gdrive_url = upload_to_gdrive(drive_service, local_file, GDRIVE_FOLDER_ID)
            
            # Update Column D (4th column) with Google Drive Link
            sheet.update_cell(idx, 4, gdrive_url)
            print(f"🎉 Successfully updated Sheet Row {idx} with link: {gdrive_url}")
            
            try:
                os.remove(local_file)
            except:
                pass
                
            uploaded_count += 1
            if uploaded_count >= 2:
                break

if __name__ == "__main__":
    process_sheet_requests()
