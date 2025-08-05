# import requests
import urllib.parse
import random
import string
import requests
import subprocess, json

class SpotifyPlaylist:
    def __init__(self):
        self.CLIENT_ID = 'd9ca7ba48366413f82eadc7f86395150'
        self.REDIRECT_URI = 'https://spotify-playlist-app-rqcw.vercel.app/callback'
        self.SCOPE = "playlist-modify-public"
        self.CLIENT_SECRET = "176f6cfaa92e4665a228d79b6c7c904a"
        self.access_token = ""
        self.billboard_100_playlist = "6UeSakyzhiEt4NB3UAd6NQ"
        self.my_playlist = "6fKsv1wxjAI2JSgz0IZucx"

    def does_track_match_preference(self, fav_genre, artist_genre):
        # inputs the list of favorite genres for the day
        if len(artist_genre) == 0:
            return True
        for ag in artist_genre:
            for fg in fav_genre:
                if fg in ag:
                    return True  

    def generate_random_state(self, length=16):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def generate_auth_url(self):
        state = self.generate_random_state()
        params = {
            'response_type': 'code',
            'client_id': self.CLIENT_ID,
            'scope': self.SCOPE,
            'redirect_uri': self.REDIRECT_URI,
            'state': state
        }
        url = 'https://accounts.spotify.com/authorize?' + urllib.parse.urlencode(params)
        return url, state

    def extract_code_from_url(self, redirect_url):
        parsed = urllib.parse.urlparse(redirect_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        return query_params.get('code', [None])[0], query_params.get('state', [None])[0]
        
    def exchange_code_for_token(self, code):
        token_url = 'https://accounts.spotify.com/api/token'
        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.REDIRECT_URI,
            'client_id': self.CLIENT_ID,
            'client_secret': self.CLIENT_SECRET
        }

        response = requests.post(token_url, data=payload)
        if response.ok:
            tokens = response.json()
            print(tokens)
            print("✅ Access Token:", tokens['access_token'])
            print("🔁 Refresh Token:", tokens.get('refresh_token'))
            return tokens['access_token']
        else:
            print("❌ Token exchange failed:", response.status_code)
            print(response.text)
    
    def get_playlist_track(self, playlist_id):
        playlist_url = "https://api.spotify.com/v1/playlists/" + playlist_id
        playlists_curl_command = [
            "curl",
            "--request", "GET",
            playlist_url,
            "--header", self.access_token
        ]

        # Run the command
        result = subprocess.run(playlists_curl_command, capture_output=True, text=True)

        # Get the response text
        try:
            results = json.loads(result.stdout)
            return results
        except json.JSONDecodeError:
            print("Failed to parse response as JSON for Spotify playlist API.")
            exit(1)
    
    def get_fav_tracks(self):
        results = self.get_playlist_track(self.billboard_100_playlist)

        # Parse the raw response and store them in playlists
        playlists = []
        for item in results["tracks"]["items"]:
            curr_dict = {}
            track = item["track"]
            track_genre = []
            for i, artist in enumerate(track["artists"]):
                artist_url = "https://api.spotify.com/v1/artists/" + artist["id"]
                artist_curl_command = [
                    "curl", 
                    "--request", "GET",
                    artist_url,
                    "--header", self.access_token
                ]
                response = subprocess.run(artist_curl_command, capture_output=True, text=True)
                try:
                    response = json.loads(response.stdout)
                except json.JSONDecodeError:
                    print("Failed to parse response as JSON for Spotify artist API.")
                    exit(1)
                
                artist_genres = response["genres"]
                track_genre.extend(artist_genres)
            print(track_genre)
            if self.does_track_match_preference(my_genre_today, track_genre):
                curr_dict["song"] = track["name"]
                curr_dict["popularity"] = track["popularity"]
                curr_dict["id"] = track["id"]
                curr_dict["spotify_uri"] = track["uri"]
                curr_dict["genres"] = track_genre
                playlists.append(curr_dict)
        
        return playlists

    # Add all songs to my playlist 6fKsv1wxjAI2JSgz0IZucx
    def add_track_to_my_playlist(self, playlists):
        data = json.dumps({
            "uris": [playlist["spotify_uri"] for playlist in playlists],
        })
        add_songs_curl_command = [
            "curl",
            "--request", "POST",
            "https://api.spotify.com/v1/playlists/6fKsv1wxjAI2JSgz0IZucx/tracks",
            "--header", self.access_token,
            "--header", "Content-Type: application/json",
            "--data", data
        ]
        response = subprocess.run(add_songs_curl_command, capture_output=True, text=True)
        print(response)
        if response.returncode == 0 and response.stdout:
            print("added songs to playlist 'Daily Billboard Stack' successfully")
        else:
            print("❌Fail to add songs to my playlist")
            exit(1)
        
    def remove_all_tracks(self):
        results = self.get_playlist_track(self.my_playlist)

        # get all tracks' uri from my playlist
        tracks_uri = []
        for item in results["tracks"]["items"]:
            curr_dict = {}
            track = item["track"]
            tracks_uri.append({"uri": track["uri"]})

        data = json.dumps({
            "tracks": tracks_uri
        })
        remove_all_tracks_curl_command = [
            "curl",
            "--request", "DELETE",
            "https://api.spotify.com/v1/playlists/6fKsv1wxjAI2JSgz0IZucx/tracks",
            "-H", "Content-Type: application/json",
            "-H", self.access_token,
            "-d", data
        ]
        response = subprocess.run(remove_all_tracks_curl_command, capture_output=True, text=True)
        print(response)
        if response.returncode == 0 and response.stdout:
            print("Clear all songs from playlist 'Daily Billboard Stack' successfullt")
        else:
            print("❌Fail to removes songs from my playlist")
            exit(1)
        
    def add_my_genre_to_playlist(self, fav_genre):
        auth_url, state = self.generate_auth_url()
        print("🔗 Open this URL in your browser and log in:")
        print(auth_url)
        
        redirect_url = input("\n📋 Paste the full redirect URL you were redirected to: ").strip()
        code, returned_state = self.extract_code_from_url(redirect_url)

        if not code:
            print("❌ No code found in redirect URL.")
            exit(1)
        elif returned_state != state:
            print("⚠️ State mismatch! Possible CSRF.")
            exit(1)
        else:
            token = self.exchange_code_for_token(code)
            print(token)
            self.access_token = "Authorization: Bearer " + token

            self.remove_all_tracks()
            my_playlist = self.get_fav_tracks()
            self.add_track_to_my_playlist(my_playlist)

