import urllib.parse
from flask import Flask, jsonify, session, redirect

from SpotifyPlaylist import SpotifyPlaylist

if __name__ == '__main__':
    app = Flask(__name__)

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
        return redirect(auth_url)
    
    @app.route('/Playlist/new/<genre>')
    def new_spotify_playlist(genre=None):
        inst = SpotifyPlaylist()
        try:
            inst.add_my_genre_to_playlist(genre)
            data = {
                "message": "This is you PUT request response",
                "status": "SUCCESS"
            }
        except:
            data = {
                "message": "This is you PUT request response",
                "status": "FAILED"
            }
        
        return jsonify(data)

    app.run(debug=True)
