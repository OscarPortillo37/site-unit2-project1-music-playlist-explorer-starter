/** 
 * Opening & Closing the Modal
*/
let filter_text = '';
let filter_func;
let playlist_json;
let last_edit_playlist_id;
let firstLoad = true;
let new_songID = 10000;
let new_playlistID = 10000;
let date_added = 2;

/* Utility Functions */
// Helper to find the index of a playlist given its ID
function findPlaylistIndByID(playlists_arr, desired_id) {
    let ind = playlists_arr.findIndex(playlist => playlist.playlistID === desired_id);
    if(ind === -1) throw new Error('Error: Couldn\'t find playlist by ID')
    return ind;
}

// Applies filter on the playlists
function applyFilteredDisplay() {
    let filtered_playlists_json = playlist_json.filter(playlist => filter_func(playlist, filter_text));
    populatePlaylists(filtered_playlists_json);
}

/* Opening and Closing Playlist Info, Add Playlist, and Edit Playlist Modals */
function openModal(playlist_album_id) {
    const modal = document.getElementById("modal");
    modal.style.display = "block";

    let playlistInd = findPlaylistIndByID(playlist_json, playlist_album_id);
    let modal_album_img = document.getElementById('modal_album_img_internal');
    let modal_playlist_name = document.getElementById('modal_playlist_name');
    let modal_creator_name = document.getElementById('modal_creator_name');
    modal_album_img.src = playlist_json[playlistInd].playlist_art;
    modal_album_img.alt = `${modal_playlist_name} playlist cover`
    modal_playlist_name.innerHTML =  playlist_json[playlistInd].playlist_name;
    modal_creator_name.innerHTML = playlist_json[playlistInd].playlist_author;
    let modal_song_info = document.getElementById('modal_song_info');
    for(const song of playlist_json[playlistInd].songs) {
        const song_html = createModalSongInfo(song);
        modal_song_info.appendChild(song_html);
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    let modal_song_info = document.getElementById('modal_song_info');
    modal_song_info.innerHTML = '';
    modal.style.display = "none";
}

function openEditModal(playlist_album_id) {
    last_edit_playlist_id = playlist_album_id;
    const edit_modal = document.getElementById("edit_modal");
    edit_modal.style.display = "block";

    let playlistInd = findPlaylistIndByID(playlist_json, playlist_album_id);
    let edit_modal_album_img = document.getElementById('edit_modal_album_img_internal');
    edit_modal_album_img.src =  playlist_json[playlistInd].playlist_art;
    edit_modal_album_img.alt = `${modal_playlist_name} playlist cover`
    let edit_playlist_name_input = document.getElementById('edit_playlist_name_input');
    let edit_playlist_author_input = document.getElementById('edit_playlist_author_input');
    edit_playlist_name_input.value =   playlist_json[playlistInd].playlist_name;
    edit_playlist_author_input.value =  playlist_json[playlistInd].playlist_author;
    let edit_songs = document.getElementById('edit_songs');
    for(const song of  playlist_json[playlistInd].songs) {
        appendEditModalSong(edit_songs, song);
    }
}

function closeEditModal() {
    const edit_modal = document.getElementById("edit_modal");
    edit_modal.style.display = "none";
}

function openAddModal() {
    const add_modal = document.getElementById("add_modal");
    add_modal.style.display = "block";
}

function closeAddModal() {
    const add_modal = document.getElementById("add_modal");
    add_modal.style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("modal");
    if (event.target == modal) {
        closeModal();
    }
    const edit_modal = document.getElementById("edit_modal");
    if(event.target == edit_modal) {
        closeEditModal();
    }
    const add_modal = document.getElementById("add_modal");
    if(event.target == add_modal) {
        closeAddModal();
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
    const like_grp = like_icon.parentNode;
    const like_cnt = like_grp.querySelector('.like_cnt')
    let playlist_card = like_cnt.parentElement.parentElement.parentElement;
    let playlist_card_id = Number(playlist_card.getAttribute('data-playlist-id'));
    let playlistInd = findPlaylistIndByID(playlist_json, playlist_card_id);
    let curr_playlist = playlist_json[playlistInd];
    if(Boolean(curr_playlist.liked)) {
        like_icon.style.color = "rgb(0, 0, 0)";
        like_icon.setAttribute('data-clicked', 'false');
        like_cnt.innerHTML = Number(like_cnt.innerHTML) - 1;
        curr_playlist.liked = false;
    }    
    else {
        like_icon.style.color = "red";
        like_icon.setAttribute('data-clicked', 'true');
        like_cnt.innerHTML = Number(like_cnt.innerHTML) + 1;
        curr_playlist.liked = true;
    }

    curr_playlist.like_cnt = Number(like_cnt.innerHTML);
}

/* Playlist Info Modal Functions */
function createPlaylistCardContainer(playlist_obj) {
    const playlistCardContainer = document.createElement('section');
    playlistCardContainer.className = 'playlist_card_container';
    const like_cnt = Number(playlist_obj.like_cnt);
    const like_color = (Boolean(playlist_obj.liked)) ? "red" : "black";
    playlistCardContainer.innerHTML = `
    <section class="playlist_card" data-playlist-id="${playlist_obj.playlistID}">
        <div class="album_img">
            <img src="${playlist_obj.playlist_art}" alt="${playlist_obj.playlist_name} by ${playlist_obj.playlist_author} playlist cover"> 
        </div>
        <div class="playlist_card_text">
            <p class="playlist_card_name">${playlist_obj.playlist_name}</p>
            <p class="playlist_card_author">Created By  ${playlist_obj.playlist_author}</p>
            <div class="like_grp">
                <p class="like" style="color: ${like_color}" data-clicked="false">&#10084;</p>
                <p class="like_cnt">${like_cnt}</p>
            </div>
            <button class="delete_btn">Delete</button>
            <button class="edit_btn">Edit</button>
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
                <img src="${song_obj.playlist_art}" alt="${song_obj.song_name} Cover" id="modal_album_img_internal">
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

/* Featured Page Functions */
function editFeaturedPlaylist(playlist_obj) {
    let featured_playlist_img = document.querySelector('#featured_playlist_img');
    featured_playlist_img.src = playlist_obj.playlist_art;
    featured_playlist_img.alt = `${playlist_obj.playlist_name} playlist cover`;
    let featured_playlist_name = document.querySelector('#featured_playlist_name');
    featured_playlist_name.innerHTML = playlist_obj.playlist_name;
}

function createNewFeaturedSong(song_obj) {
    let new_song = document.createElement('section');
    new_song.className = 'featured_song';
    const min =  song_obj.duration_min.toString().padStart(2, '0');
    const sec = song_obj.duration_sec.toString().padStart(2, '0');
    new_song.innerHTML = `
        <section class="featured_song_container">
            <img src="${song_obj.playlist_art}" alt="${song_obj.song_name} Cover" class="featured_song_img">
            <div class="featured_song_text">
                <p class="featured_song_name">${song_obj.song_name}</p>
                <p class="featured_song_author">${song_obj.song_author}</p>
                <p class="featured_song_album">${song_obj.song_album}</p>
                <p class="featured_song_duration">${min}:${sec}</p>
            </div>
        </section>
    `;
    return new_song;
}

/* Populating playlists (performed on refresh or after edit, add, delete, sort, search) */
function populatePlaylists(playlists_populate_json) {
    const missing_playlists_msg = document.querySelector('#missing_playlists');
    let playlist_cards_section = document.querySelector("#playlist_cards");
    playlist_cards_section.innerHTML = '';
    if(playlists_populate_json.length === 0) {
        missing_playlists_msg.style.display = "block";
    }
    else {
        missing_playlists_msg.style.display = "none";
        for(const playlist of playlists_populate_json) {
            let playlist_html = createPlaylistCardContainer(playlist);
            playlist_cards_section.append(playlist_html);
        }
    }

    playlistEventListeners();
}

/* Search Logic */ 
function isNameSearched(playlist, search_text) {
    if(playlist.playlist_name.toLowerCase().includes(search_text)) return true;
    else return false;
}

function isAuthorSearched(playlist, search_text) {
    if(playlist.playlist_author.toLowerCase().includes(search_text)) return true;
    else return false;
}

/* Sort Logic */
function sortPlaylists(playlist_json) {
    if(event.target.value === 'alphabetically') {
        playlist_json.sort((a, b) => a.playlist_name.localeCompare(b.playlist_name))
    }
    else if(event.target.value === 'like_cnt_desc') {
        playlist_json.sort((a, b) => b.like_cnt - a.like_cnt);
    }
    else if(event.target.value === 'date_added_chron') {
        playlist_json.sort((a, b) => {
            if (a.date_added === b.date_added) {
                return a.playlist_name.localeCompare(b.playlist_name); // Secondary sort
            }
            return a.value - b.value; // Primary sort
        });
    }
}

// Adds click/hover/click handling for each playlist card, like icon, delete, and edit buttons
function playlistEventListeners() {
    // Add modal event listener for identificaiton of clicked playlist id
    document.querySelectorAll('.playlist_card').forEach(playlist_card => 
    {
        playlist_card.addEventListener('click', (event) => {
            const selected_playlist_id = Number(playlist_card.getAttribute('data-playlist-id'));
            openModal(selected_playlist_id);
        });
    });

    // Like icon event listeners (hover, click)
    let like_icons = document.getElementsByClassName('like');
    for(let like_icon of like_icons){
        like_icon.addEventListener('mouseover', () => {
            handleLikeHover(like_icon, true); 
        });
        like_icon.addEventListener('mouseout', () => {
            handleLikeHover(like_icon, false)
        });
        like_icon.addEventListener(`click`, (event) => {
            handleLikeClick(like_icon);
            event.stopPropagation();
        }, true);
    }

    // Delete playlist event listener
    const delete_btns = document.getElementsByClassName('delete_btn');
    Array.from(delete_btns).forEach((delete_btn) => {
        delete_btn.addEventListener('click', (event) => {
            const playlist_card_id = Number(delete_btn.parentElement.parentElement.getAttribute('data-playlist-id'));
            let playlist_card_container = delete_btn.parentElement.parentElement.parentElement;
            playlist_card_container.remove();
            
            let playlistInd = findPlaylistIndByID(playlist_json, playlist_card_id);
            playlist_json.splice(playlistInd, 1);
            applyFilteredDisplay();
            event.stopPropagation();
        }, true);
    });

    // Edit playlist event listener
    const edit_btns = document.getElementsByClassName('edit_btn');
    Array.from(edit_btns).forEach((edit_btn) => {
        edit_btn.addEventListener('click', (event) => {
            const playlist_card_id = Number(edit_btn.parentElement.parentElement.getAttribute('data-playlist-id'));
            openEditModal(playlist_card_id);
            event.stopPropagation();
        });
    });
}


/* All & Featured Logic (called on load) */
function allLogic() {
    // Populate playlists
    populatePlaylists(playlist_json);

    // Add shuffle event listener
    const shuffle_btn = document.getElementById('shuffle_btn');
    shuffle_btn.addEventListener('click', (event) => {
        let songs = document.getElementById('modal_song_info');
        let songs_arr_temp = Array.from(songs.children);
        for(let i = 0; i < songs.childElementCount; i++) {
            const j = Math.floor(Math.random() * (songs.childElementCount));
            [songs_arr_temp[i], songs_arr_temp[j]] = [songs_arr_temp[j], songs_arr_temp[i]];
        }
        songs.innerHTML = '';
        songs_arr_temp.forEach(function(shuffled_song) {songs.appendChild(shuffled_song)});
    });

    // Edit modal's submit event listener
    let edit_submit_btn = document.querySelector('#edit_submit_btn');
    edit_submit_btn.addEventListener('click', (event) => {
        let edit_playlist_name_input = document.querySelector('#edit_playlist_name_input');
        let edit_playlist_author_input = document.querySelector('#edit_playlist_author_input');
        let new_playlist_name = edit_playlist_name_input.value;
        let new_playlist_author = edit_playlist_author_input.value;

        let playlistInd = findPlaylistIndByID(playlist_json, last_edit_playlist_id);
        playlist_json[playlistInd].playlist_name = new_playlist_name;
        playlist_json[playlistInd].playlist_author = new_playlist_author;
        // Re-apply filtering
        closeEditModal();
        applyFilteredDisplay();
    });

    // Edit modal's add song event listener
    let edit_song_btn = document.querySelector('#edit_song_btn');
    edit_song_btn.addEventListener('click', () => {
        let new_song_duration = Number(document.querySelector('#edit_song_duration_input').value);
        let playlistInd = findPlaylistIndByID(playlist_json, last_edit_playlist_id);
        playlist_json[playlistInd].songs.push({
            "songID": new_songID++,
            "song_name": document.querySelector('#edit_song_name_input').value,
            "song_album": document.querySelector('#edit_song_album_input').value,
            "playlist_art": playlist_json[playlistInd].playlist_art,
            "duration_min": Math.floor(new_song_duration / 60),
            "duration_sec": new_song_duration % 60,
            "song_author": document.querySelector('#edit_song_author_input').value,
        });
    });


    let added_songs_json_arr = [];

    // Add modal event listeners for submit & add song
    let add_submit_btn = document.getElementById('add_submit_btn');
    add_submit_btn.addEventListener('click', (event) => {
        added_playlist_json_arr = {
            "playlistID": new_playlistID++,
            "playlist_name": document.querySelector('#add_playlist_name_input').value,
            "playlist_author": document.querySelector('#add_playlist_author_input').value,
            "playlist_art": document.querySelector('#add_playlist_img_input').value,
            "like_cnt": 0,
            "liked": false,
            "songs" : [],
            "date_added": date_added++,
        }
        added_playlist_json_arr.songs = added_songs_json_arr;
        playlist_json.push(added_playlist_json_arr);
        closeAddModal();
        let sort_type_dropdown = document.getElementById('sort_type_dropdown');
        if(sort_type_dropdown.value != 'none') {
            sortPlaylists(playlist_json);
        }
        applyFilteredDisplay();
    });

    // Add playlist's add song event listener
    let add_add_song_btn = document.querySelector('#add_add_song_btn');
    add_add_song_btn.addEventListener('click', (event) => {
        let new_song_duration = Number(document.querySelector('#add_song_duration_input').value);
        added_songs_json_arr.push({
            "songID": new_songID++,
            "song_name": document.querySelector('#add_song_name_input').value,
            "song_album": document.querySelector('#add_song_album_input').value,
            "playlist_art": 'assets/img/song.png',
            "duration_min": Math.floor(new_song_duration / 60),
            "duration_sec": new_song_duration % 60,
            "song_author": document.querySelector('#add_song_author_input').value
        });

        document.querySelector('#add_song_name_input').value = '';
        document.querySelector('#add_song_author_input').value = '';
        document.querySelector('#add_song_album_input').value = '';
        document.querySelector('#add_song_duration_input').value = '';
    });

    // Add playlist button event listener
    let add_playlist_btn = document.getElementById('add_playlist_btn');
    add_playlist_btn.addEventListener('click', (event) => {
        openAddModal();
    });

    // Sort playlist button event listener
    let sort_type_dropdown = document.getElementById('sort_type_dropdown');
    sort_type_dropdown.addEventListener('change', (event) => {
        sortPlaylists(playlist_json);
        applyFilteredDisplay();
    });

    // Search event listeners
    const search_form = document.getElementById('search_form');
    // const clear_search = document.getElementById('clear_search');
    search_form.addEventListener('submit', (event) => {
        event.preventDefault();
        const search_type_value = document.getElementById(`search_type_dropdown`).value;
        filter_text = document.getElementById('search_input').value.toLowerCase();
        filter_func = (search_type_value === 'name') ? isNameSearched : isAuthorSearched;
        applyFilteredDisplay();
        event.stopPropagation();
    });
    search_form.addEventListener('reset', (event) => {
        event.preventDefault();
        let search_text = document.getElementById('search_input');
        search_text.value = '';
        filter_text = '';
        populatePlaylists(playlist_json);
    });
}

// Logic for the Featured Page
function featuredLogic() {
    // Populate randomized playlist
    const missing_playlists_msg = document.querySelector('#missing_playlists');
    const featured_article = document.querySelector('#featured');
    if(playlist_json.length === 0) {
        missing_playlists_msg.style.display = "block";
        featured_article.style.display = "none";
    }
    else {
        missing_playlists_msg.style.display = "none";
        const playlist_obj = playlist_json[Math.floor(Math.random() * playlist_json.length)];
        editFeaturedPlaylist(playlist_obj); // edits featured_playlist
        const featured_songs = document.querySelector('#featured_songs');
        featured_songs.innerHTML = '';
        playlist_obj.songs.forEach(song_obj => {
            let featured_song_html = createNewFeaturedSong(song_obj);
            featured_songs.appendChild(featured_song_html);
        })
    }
}

// Triggered on page load
document.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
        window.location.replace('index.html');
    }
    const url_path = window.location.pathname;
    if(firstLoad){
        fetch('data/data.json')
            .then( response => {
                if(!response.ok) {
                    throw new Error('Did not successfully retrieve data.json');
                }
                return response.json();
            })
            .then(json => {
                playlist_json = json;
                if(url_path.endsWith('index.html')){
                    allLogic();
                }
                else if(url_path.endsWith('featured.html')){
                    featuredLogic();
                }
                else {
                    allLogic();
                }
                firstLoad = false;
            })
            .catch(error =>{
                console.error('Error: ', error);
            });
    }
    else 
    {
        try {
            if(url_path.endsWith('index.html')){
                allLogic();
            }
            else if(url_path.endsWith('featured.html')){
                featuredLogic();
            }
            else throw new Error('url isn\'t of index_main.html or featuredLogic.html')
        }
        catch(error){
            console.error("Error: ", error);
        }
    }
});
