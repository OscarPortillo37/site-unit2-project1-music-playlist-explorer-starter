/** 
 * Opening & Closing the Modal
*/
const modal = document.getElementById("modal");
const exit = document.getElementsByClassName("close");
let playlist_json;

function openModal(playlist_album_id) {
    console.log(playlist_album_id);
    modal.style.display = "block";

    let wasFound = false;
    try{
        for(const playlist of playlist_json) {
            if(playlist.playlistID === playlist_album_id) {
                wasFound = true;
                let modal_album_img = document.getElementById('modal_album_img_internal');
                let modal_playlist_name = document.getElementById('modal_playlist_name');
                let modal_creator_name = document.getElementById('modal_creator_name');
                modal_album_img.src = playlist.playlist_art;
                modal_playlist_name.innerHTML =  playlist.playlist_name;
                modal_creator_name.innerHTML = playlist.playlist_author;
                let modal_song_info = document.getElementById('modal_song_info');
                for(const song of playlist.songs) {
                    const song_html = createModalSongInfo(song);
                    modal_song_info.appendChild(song_html);
                }
            }
        }
        if(!wasFound) throw new Error('Couldn\'t find playlist ID used to populate modal');
    }
    catch(error){
        console.error('openModal() Error:', error);
    }
}

function closeModal() {
    let modal_song_info = document.getElementById('modal_song_info');
    modal_song_info.innerHTML = '';
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

/* Like Buttons */
function handleLikeHover(like_icon, isMouseOver) {
    const style = window.getComputedStyle(like_icon);
    const color = style.getPropertyValue('color');
    const liked = (like_icon.getAttribute('data-clicked') === 'true');
    if(!liked) {
        like_icon.style.color = (isMouseOver) ? "red" : "rgb(0, 0, 0)";
    }
}

function handleLikeClick(like_icon) {
    const style = window.getComputedStyle(like_icon);
    const color = style.getPropertyValue('color');
    const like_grp = like_icon.parentNode;
    const like_cnt = like_grp.querySelector('.like_cnt')
    console.log(like_grp);
    console.log(like_icon.style.color);
    let liked = (like_icon.getAttribute('data-clicked') === 'true');
    if(liked) {
        like_icon.style.color = "rgb(0, 0, 0)";
        like_icon.setAttribute('data-clicked', 'false');
        console.log('unliked');
        like_cnt.innerHTML = Number(like_cnt.innerHTML) - 1;
    }    
    else {
        like_icon.style.color = "red";
        like_icon.setAttribute('data-clicked', 'true');
        console.log('liked');
        like_cnt.innerHTML = Number(like_cnt.innerHTML) + 1;
    }
}

/**
 * Parsing playlists & modal
 */
function createPlaylistCardContainer(playlist_obj) {
    const playlistCardContainer = document.createElement('section');
    playlistCardContainer.className = 'playlist_card_container';
    playlistCardContainer.innerHTML = `
    <section class="playlist_card" data-playlist-id="${playlist_obj.playlistID}">
        <div class="album_img">
            <img src="${playlist_obj.playlist_art}" alt="${playlist_obj.playlist_name} by ${playlist_obj.playlist_author} album cover"> 
        </div>
        <div class="playlist_card_text">
            <p class="playlist_card_name">${playlist_obj.playlist_name}</p>
            <p class="playlist_card_author">Created By  ${playlist_obj.playlist_author}</p>
            <div class="like_grp">
                <p class="like" data-clicked: "false">&#10084;</p>
                <p class="like_cnt">0</p>
            </div>
        </div>
    </section>
    `;
    return playlistCardContainer;
}

function createModalSongInfo(song_obj) {
    const songContainer = document.createElement('section');
    songContainer.className = 'song_container';
    const min =  song_obj.duration_min.toString().padStart(2, '0');
    const sec = song_obj.duration_sec.toString().padStart(2, '0');
    songContainer.innerHTML = `
        <div class="song">
            <div class="song_img">
                <img src="${song_obj.playlist_art}" alt="${song_obj.song_name} Image" id="modal_album_img_internal">
            </div>
        </div>
        <div class="song_descr">
            <p class="modal_song_title">${song_obj.song_name}</p>
            <p class="modal_artist_name">${song_obj.song_author}</p>
            <p class="modal_artist_name">${song_obj.song_album}</p>
        </div>
        <div class="duration">
            <p>${min}:${sec}</p>
        </div>
    `;
    return songContainer;
}

fetch('data/data.json')
    .then(response => {
        if(!response.ok) {
            throw new Error('Did not successfully retrieve data.json');
        } 
        return response.json();
    })
    .then(playlist => {
        playlist_json = playlist;

        // Populate playlists
        const missing_playlists_msg = document.querySelector('#missing_playlists');
        if(playlist_json.length === 0) {
            missing_playlists_msg.style.display = "block";
        }
        else {
            missing_playlists_msg.style.display = "none";
            for(const playlist of playlist_json) {
                let playlist_html = createPlaylistCardContainer(playlist);
                let playlist_cards_section = document.querySelector("#playlist_cards");
                playlist_cards_section.append(playlist_html);
            }
        }

        // Add modal event listener for identificaiton of clicked playlist id
        let selected_playlist_id;
        document.querySelectorAll('.playlist_card').forEach(playlist_card => 
        {
            playlist_card.addEventListener('click', () => {
                const selected_playlist_id = Number(playlist_card.getAttribute('data-playlist-id'));
                openModal(selected_playlist_id);
            });
        });

        // Add like icon event listeners (hover, click)
        let like_icons = document.getElementsByClassName('like');
        for(let like_icon of like_icons){
            console.log(like_icon);
            // TOOD: Continue
            like_icon.addEventListener('mouseover', () => {
                handleLikeHover(like_icon, true); 
            });
            like_icon.addEventListener('mouseout', () => {
                handleLikeHover(like_icon, false)
            });
            like_icon.addEventListener(`click`, () => {
                handleLikeClick(like_icon);
                console.log('clicked');
                event.stopPropagation();
            }, true);
        }

        // Add shuffle event listener
        const shuffle_btn = document.getElementById('shuffle_btn');
        shuffle_btn.addEventListener('click', () => {
            let songs = document.getElementById('modal_song_info');
            let songs_arr_temp = Array.from(songs.children);
            for(let i = 0; i < songs.childElementCount; i++) {
                const j = Math.floor(Math.random() * (songs.childElementCount));
                [songs_arr_temp[i], songs_arr_temp[j]] = [songs_arr_temp[j], songs_arr_temp[i]];
            }

            console.log(songs_arr_temp);
            songs.innerHTML = '';
            songs_arr_temp.forEach(function(shuffled_song) {songs.appendChild(shuffled_song)});
        });
    })
    .catch(error => {
        console.error('Fetch error:', error)
});

