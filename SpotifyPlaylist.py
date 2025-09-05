# import requests
import urllib.parse
import random
import string
import requests
import base64
import json

class SpotifyPlaylist:
    def __init__(self):
        self.CLIENT_ID = 'd9ca7ba48366413f82eadc7f86395150'
        self.REDIRECT_URI = 'https://spotify-playlist-app-rqcw.vercel.app/callback'
        self.SCOPE = "playlist-modify-public"
        self.CLIENT_SECRET = "176f6cfaa92e4665a228d79b6c7c904a"
        self.access_token = ""
        self.billboard_100_playlist = "6UeSakyzhiEt4NB3UAd6NQ"
        self.my_playlist = "6fKsv1wxjAI2JSgz0IZucx"
        self.errors = ""

    def does_track_match_preference(self, fav_genre, artist_genre):
        # inputs the list of favorite genres for the day
        if len(artist_genre) == 0:
            return True
        if not isinstance(fav_genre, list):
            fav_genre = [fav_genre]
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
            print("✅ Access Token:", tokens['access_token'])
            print("🔁 Refresh Token:", tokens.get('refresh_token'))
            return tokens['access_token']
        else:
            print("❌ Token exchange failed:", response.status_code)
            self.errors += "In getting authoirzation code, encounter issue: " + str(json.loads(response.text).get('error', {}))
    
    ## get access token that doesn't need to modify other playlist
    def get_access_token(self):
        token_url = 'https://accounts.spotify.com/api/token'

        auth_header = base64.b64encode(f"{self.CLIENT_ID}:{self.CLIENT_SECRET}".encode("ascii")).decode("ascii")
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}
        response = requests.post(token_url, headers=headers, data=data)
    
        if response.ok:
            tokens = response.json()
            print("✅ Access Token:", tokens['access_token'])
            return tokens['access_token']
        else:
            print("❌ Token exchange failed:", response.status_code)
            self.errors += "In getting access token, encounter issue: " + str(json.loads(response.text).get('error', {}))
    
    def get_playlist_track(self, playlist_id, access_token):
        playlist_url = 'https://api.spotify.com/v1/playlists/' + playlist_id

        header = {
            "Authorization": access_token
        }
        # Run the command
        try:
            result = requests.get(playlist_url, headers=header, timeout=10)
            # Get the response text
            if result.status_code == 200:
                results = json.loads(result.text)
                return results
            else:
                print("Failed to parse response as JSON for Spotify playlist API error:", repr(e))
                self.errors += "In getting tracks from playlist,  issue: " + str(json.loads(response.text).get('error', {}))
        except Exception as e:
            print("errors in getting list of tracks from playlist", playlist_id, e)
        
    
    def get_fav_tracks(self, my_genre_today, access_token):
        results = self.get_playlist_track(self.billboard_100_playlist, access_token)
        # Parse the raw response and store them in playlists
        playlists = []
        for item in results["tracks"]["items"]:
            curr_dict = {}
            track = item["track"]
            track_genre = []
            artists = []
            for i, artist in enumerate(track["artists"]):
                header = {
                    "Authorization": access_token
                }
                artist_url = "https://api.spotify.com/v1/artists/" + artist["id"]

                res = requests.get(artist_url, headers=header)
                artists.append(artist["name"])
                try:
                    response = json.loads(res.text)
                except Exception as e:
                    print("Failed to parse response as JSON for Spotify artist API: error ", repr(e))
                    self.errors += "In getting artist information for artist " + artist["name"] + " getting error "+ e
                artist_genres = response["genres"]
                track_genre.extend(artist_genres)
            print(track_genre)
            if self.does_track_match_preference(my_genre_today, track_genre):
                print("it matches the selection!")
                curr_dict["song"] = track["name"]
                curr_dict["popularity"] = track["popularity"]
                curr_dict["id"] = track["id"]
                curr_dict["spotify_uri"] = track["uri"]
                curr_dict["genres"] = track_genre
                curr_dict["artists"] = artists
                playlists.append(curr_dict)
        
        return playlists

    # Add all songs to my playlist 6fKsv1wxjAI2JSgz0IZucx
    def add_track_to_my_playlist(self, playlists):
        payload = {
            "uris": [playlist["spotify_uri"] for playlist in playlists],
        }
        headers = {
            "Authorization": self.access_token,
            "Content-Type": "application/json"
        }

        # Send POST request
        response = requests.post(
            "https://api.spotify.com/v1/playlists/6fKsv1wxjAI2JSgz0IZucx/tracks",
            headers=headers,
            json=payload  # Automatically JSON-encoded
        )
        if response.status_code in [200, 201]:
            print("added songs to playlist 'Daily Billboard Stack' successfully")
        else:
            print("❌Fail to add songs to my playlist")
            print(response, response.text)
            self.errors += "In adding tracks to my playlist, getting issue: " + str(json.loads(response.text).get('error', {}))
        
    def remove_all_tracks(self):
        results = self.get_playlist_track(self.my_playlist, self.access_token)
        if len(results["tracks"]["items"]) == 0:
            print("There are no songs to clear from playlist 'Daily Billboard Stack', exit")
            return
        # get all tracks' uri from my playlist
        tracks_uri = []
        for item in results["tracks"]["items"]:
            curr_dict = {}
            track = item["track"]
            tracks_uri.append({"uri": track["uri"]})

        payload = {
            "tracks": tracks_uri
        }
        headers = {
            "Authorization": self.access_token,
            "Content-Type": "application/json"
        }
        response = requests.delete(
            "https://api.spotify.com/v1/playlists/6fKsv1wxjAI2JSgz0IZucx/tracks",
            headers=headers,
            json=payload
        )
        if response.status_code == 200:
            print("Clear all songs from playlist 'Daily Billboard Stack' successfullt")
        else:
            print("❌Fail to removes songs from my playlist", response.text)
            self.errors += "in removing trakcs from my playlist, getting issue: " + str(json.loads(response.text).get('error', {}))
        
    def add_my_genre_to_playlist(self, fav_genre):
        auth_url, state = self.generate_auth_url()
        print("🔗 Open this URL in your browser and log in:")
        print(auth_url)
        
        redirect_url = input("\n📋 Paste the full redirect URL you were redirected to: ").strip()
        code, returned_state = self.extract_code_from_url(redirect_url)

        if not code:
            print("❌ No code found in redirect URL.")
            self.errors += "❌ No code found in redirect URL."
        elif returned_state != state:
            print("⚠️ State mismatch! Possible CSRF.")
            self.errors += "⚠️ State mismatch! Possible CSRF."
        else:
            token = self.exchange_code_for_token(code)

            self.access_token = "Bearer " + token
            self.remove_all_tracks()
            print("remove all tracks")
            my_playlist = self.get_fav_tracks(fav_genre, self.access_token)
            print("Got fav tracks")
            self.add_track_to_my_playlist(my_playlist)
        return self.errors

