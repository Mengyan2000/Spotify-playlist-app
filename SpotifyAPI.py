import urllib.parse
from flask import Flask, jsonify, session, redirect, jsonify, request
from flask_cors import CORS, cross_origin

from SpotifyPlaylist import SpotifyPlaylist

if __name__ == '__main__':
    app = Flask(__name__)

    # Allow CORS from your frontend domain
    CORS(app, origins=["https://spotify-playlist-app-rqcw.vercel.app", "http://localhost:8081"])

    # deprecated
    @app.route('/start_login')
    def start_login():
        inst = SpotifyPlaylist()

        state = inst.generate_random_state(16)

        query_params = {
            'response_type': 'code',
            'client_id': inst.CLIENT_ID,
            'scope': "playlist-modify-public",
            'redirect_uri': inst.REDIRECT_URI,
            'state': state
        }
        auth_url = 'https://accounts.spotify.com/authorize?' + urllib.parse.urlencode(query_params)
        return redirect(auth_url, code=303)
    
    @app.route('/get_access_token', methods=['GET'])
    def get_user_access_token():
        inst = SpotifyPlaylist()
        access_token = inst.get_access_token()
        response = {
            "access_token": access_token
        }
        return jsonify(response), 200

    @app.route('/PlaylistSuggest/<genre>', methods=['POST'])
    def get_spotify_playlist(genre=None):
        inst = SpotifyPlaylist()
        if request.is_json:
            print("API request", request.json)
            access_token = "Bearer " + request.json.get("access_token")
        try:
            if not inst.errors:
                playlist = inst.get_fav_tracks(genre, access_token)
                data = {
                    "message": playlist,
                    "status": "SUCCESS"
                }
            else:
                data = {
                    "message": inst.errors,
                    "status": "FAILED"
                }
        except:
            data = {
                "message": "This is you PUT request response",
                "status": "FAILED"
            }

        return jsonify(data), 200
    
    @app.route('/Playlist/new/<genre>')
    def new_spotify_playlist(genre=None):
        inst = SpotifyPlaylist()
        if not inst.errors:
            inst.add_my_genre_to_playlist(genre)
            data = {
                "message": "This is you PUT request response",
                "status": "SUCCESS"
            }
        else:
            data = {
                "message": inst.errors,
                "status": "FAILED"
            }
        
        return jsonify(data)

    app.run(debug=True)
