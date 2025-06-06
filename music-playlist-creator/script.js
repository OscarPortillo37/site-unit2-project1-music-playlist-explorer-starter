/** 
 * Opening & Closing the Modal
*/
let filter_text = '';
let filter_func;
let playlist_json;
let last_edit_playlist_id;
let firstLoad = true;
let new_songID = 10000;

function openModal(playlist_album_id) {
    const modal = document.getElementById("modal");
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
                modal_album_img.alt = `${modal_playlist_name} playlist cover`
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
    const modal = document.getElementById("modal");
    let modal_song_info = document.getElementById('modal_song_info');
    modal_song_info.innerHTML = '';
    modal.style.display = "none";
}

function openEditModal(playlist_album_id) {
    last_edit_playlist_id = playlist_album_id;
    const edit_modal = document.getElementById("edit_modal");
    console.log(playlist_album_id);
    edit_modal.style.display = "block";

    let wasFound = false;
    try{
        for(const playlist of playlist_json) {
            if(playlist.playlistID === playlist_album_id) {
                wasFound = true;
                let edit_modal_album_img = document.getElementById('edit_modal_album_img_internal');
                edit_modal_album_img.src = playlist.playlist_art;
                edit_modal_album_img.alt = `${modal_playlist_name} playlist cover`
                let edit_playlist_name_input = document.getElementById('edit_playlist_name_input');
                let edit_playlist_author_input = document.getElementById('edit_playlist_author_input');
                edit_playlist_name_input.value =  playlist.playlist_name;
                edit_playlist_author_input.value = playlist.playlist_author;
                let edit_songs = document.getElementById('edit_songs');
                for(const song of playlist.songs) {
                    appendEditModalSong(edit_songs, song);
                }
            }
        }
        if(!wasFound) throw new Error('Couldn\'t find playlist ID used to populate modal');
    }
    catch(error){
        console.error('openModal() Error:', error);
    }
}

function closeEditModal() {
    const edit_modal = document.getElementById("edit_modal");
    let modal_song_info = document.getElementById('edit_modal_album_text_info');
    edit_modal.style.display = "none";
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
    // console.log(like_grp);
    // console.log(like_icon.style.color);
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
            <img src="${playlist_obj.playlist_art}" alt="${playlist_obj.playlist_name} by ${playlist_obj.playlist_author} playlist cover"> 
        </div>
        <div class="playlist_card_text">
            <p class="playlist_card_name">${playlist_obj.playlist_name}</p>
            <p class="playlist_card_author">Created By  ${playlist_obj.playlist_author}</p>
            <div class="like_grp">
                <p class="like" data-clicked="false">&#10084;</p>
                <p class="like_cnt">0</p>
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

// function appendEditModalSong(edit_songs, song) {
//     const editSong = document.createElement('section');
//     editSong.className = 'edit_song';
//     editSong.setAttribute('data-song-id', Number(song.songID));
//     editSong.innerHTML = `
//         <p class="song_head">Song</p>
//         <div class="edit_song_name">
//             <p>Song Name</p>
//             <form class="edit_song_name_form">
//                 <input type="text" class="edit_song_name_input" placeholder="Type your search…" aria-label="Search">
//             </form>                                    
//         </div>
//         <div class="edit_song_author">
//             <p>Song Author</p>
//             <form class="edit_song_author_form">
//                 <input type="text" class="edit_song_author_input" placeholder="Type your search…" aria-label="Search">
//             </form>                                      
//         </div>
//         <div class="edit_song_album">
//             <p>Song Album</p>
//             <form class="edit_song_album_form">
//                 <input type="text" class="edit_song_album_input" placeholder="Type your search…" aria-label="Search">
//             </form>                                      
//         </div>
//         <div class="edit_song_duration">
//             <p>Song Duration (s)</p>
//             <form class="edit_song_album_form">
//                 <input type="text" class="edit_song_album_input" placeholder="Type your search…" aria-label="Search">
//             </form>                                       
//         </div>   
//     `;
//     edit_songs.appendChild(editSong);
//     const songID_text= String(song.songID);
//     curr_edit_song_name = document.querySelector(`.edit_song[data-song-id="${songID_text}"] .edit_song_name_input`)
//     curr_edit_song_name.value = song.song_name;
//     curr_edit_song_author = document.querySelector(`.edit_song[data-song-id="${songID_text}"] .edit_song_author_input`)
//     curr_edit_song_author.value = song.song_author;
//     curr_edit_song_album = document.querySelector(`.edit_song[data-song-id="${songID_text}"] .edit_song_album_input`)
//     curr_edit_song_album.value = song.song_album;
//     curr_edit_song_duration = document.querySelector(`.edit_song[data-song-id="${songID_text}"] .edit_song_duration_input`)
//     curr_edit_song_duration.value = (Number(song.duration_min)*60 + Number(song.duration_sec)) toString();
// }

/* Parsing Featured Page */
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


function playlistEventListeners() {
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
        // console.log(like_icon);
        // TOOD: Continue
        like_icon.addEventListener('mouseover', () => {
            handleLikeHover(like_icon, true); 
        });
        like_icon.addEventListener('mouseout', () => {
            handleLikeHover(like_icon, false)
        });
        like_icon.addEventListener(`click`, (event) => {
            handleLikeClick(like_icon);
            console.log('clicked');
            event.stopPropagation();
        }, true);
    }

    // Add delete event listener
    const delete_btns = document.getElementsByClassName('delete_btn');
    Array.from(delete_btns).forEach((delete_btn) => {
        delete_btn.addEventListener('click', () => {
            const playlist_card_id = Number(delete_btn.parentElement.parentElement.getAttribute('data-playlist-id'));
            let playlist_card_container = delete_btn.parentElement.parentElement.parentElement;
            playlist_card_container.remove();
            
            try{
                let foundPlaylist = false;
                let playlistInd;
                for(let i = 0; i < playlist_json.length; i++){
                    if(playlist_json[i].playlistID === playlist_card_id) {
                        playlistInd = i;
                        foundPlaylist = true;
                    }
                }
                if(!foundPlaylist) throw new Error('Failed to find playlist in json consistent w/ pressed playlist\'s playlist ID');
                playlist_json.splice(playlistInd, 1);
                // Re-apply filtering
                let filtered_playlists_json = playlist_json.filter(playlist => isNameSearched(playlist, filter_text));
                populatePlaylists(filtered_playlists_json);
            } catch(error) {
                console.error('Error: ', error);
            }
        event.stopPropagation();
        }, true);
    });

    const edit_btns = document.getElementsByClassName('edit_btn');
    Array.from(edit_btns).forEach((edit_btn) => {
        edit_btn.addEventListener('click', () => {
            const playlist_card_id = Number(edit_btn.parentElement.parentElement.getAttribute('data-playlist-id'));
            openEditModal(playlist_card_id);
            event.stopPropagation();
        }, true);
    });
}


/* All & Featured Logic (called on load) */
function allLogic() {
    // Populate playlists
    populatePlaylists(playlist_json);

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

    // Add modal event listeners for submit & add song
    let edit_submit_btn = document.querySelector('#edit_submit_btn');
    edit_submit_btn.addEventListener('click', () => {
        let edit_playlist_name_input = document.querySelector('#edit_playlist_name_input');
        let edit_playlist_author_input = document.querySelector('#edit_playlist_author_input');
        let new_playlist_name = edit_playlist_name_input.value;
        let new_playlist_author = edit_playlist_author_input.value;
        try{
            let foundPlaylist = false;
            let playlistInd;
            for(let i = 0; i < playlist_json.length; i++){
                if(playlist_json[i].playlistID === last_edit_playlist_id) {
                    playlistInd = i;
                    foundPlaylist = true;
                }
            }
            if(!foundPlaylist) throw new Error('Failed to find playlist in json consistent w/ pressed playlist\'s playlist ID');
            playlist_json[playlistInd].playlist_name = new_playlist_name;
            playlist_json[playlistInd].playlist_author = new_playlist_author;
            // Re-apply filtering
            closeEditModal();
            let filtered_playlists_json = playlist_json.filter(playlist => isNameSearched(playlist, filter_text));
            populatePlaylists(filtered_playlists_json);
        } catch(error) {
            console.error('Error: ', error);
        }
    });
    let add_song_btn = document.querySelector('#add_song_btn');
    add_song_btn.addEventListener('click', () => {
        let new_song_name = document.querySelector('#edit_song_name_input').value;
        let new_song_author = document.querySelector('#edit_song_author_input').value;
        let new_song_album = document.querySelector('#edit_song_album_input').value;
        let new_song_duration = Number(document.querySelector('#edit_song_duration_input').value);
        // TODO: Add duration here
        let playlistInd;
        for(let i = 0; i < playlist_json.length; i++){
            if(playlist_json[i].playlistID === last_edit_playlist_id) {
                playlistInd = i;
                foundPlaylist = true;
            }
        }
        let new_song_img = playlist_json[playlistInd].playlist_art;
        playlist_json[playlistInd].songs.push({
            "songID": new_songID++,
            "song_name": new_song_name,
            "song_album": new_song_album,
            "playlist_art": new_song_img,
            "duration_min": Math.floor(new_song_duration / 60),
            "duration_sec": new_song_duration % 60,
            "song_author": new_song_author
        });
    });

    // Add search event listeners
    const submit_search = document.getElementById('submit_search');
    const clear_search = document.getElementById('clear_search');
    submit_search.addEventListener('click', () => {
        event.preventDefault();
        const search_type_value = document.getElementById(`search_type_dropdown`).value;
        filter_type = search_type_value;
        const search_text = document.getElementById('search_input').value.toLowerCase();
        console.log(search_text);
        if(search_type_value === 'name') {
            filter_func = isNameSearched;
            let filtered_playlists_json = playlist_json.filter(playlist => isNameSearched(playlist, search_text));
            populatePlaylists(filtered_playlists_json);
        }
        else { // author
            filter_func = isAuthorSearched;
            let filtered_playlists_json = playlist_json.filter(playlist => isAuthorSearched(playlist, search_text));
            populatePlaylists(filtered_playlists_json);
        }
    });
    clear_search.addEventListener('click', () => {
        event.preventDefault();
        let search_text = document.getElementById('search_input');
        search_text.value = '';
        filter_text = '';
        populatePlaylists(playlist_json);
    });

}

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
        console.log(playlist_obj.songs);
        playlist_obj.songs.forEach(song_obj => {
            let featured_song_html = createNewFeaturedSong(song_obj);
            featured_songs.appendChild(featured_song_html);
        })
    }
    // Add navigation bar listener
    const featured_tab = document.getElementById('featured_tab');
    const all_tab = document.getElementById('all_tab');

}

// TODO: edit the event listener
document.addEventListener('DOMContentLoaded', () => {
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
        console.log('checking json');
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

// /* Navigation (including going to featured page) */
// function loadPage(isFeatured) {
//     let main_html = document.querySelector(`main`);
//     if(isFeatured) {
//         fetch('featured.html')
//             .then(fetched_page => {
//                 if(!fetched_page.ok) throw new Error('Failed to fetch featured.html');
//                 else return fetched_page.text();
//             })
//             .then(page_html_text => {
//                 const parser = new DOMParser();
//                 const featured_html = parser.parseFromString(page_html_text, 'text/html');

//                 const featured_main = featured_html.querySelector('main');
//                 console.log(featured_main);
//                 main_html.innerHTML = featured_main.innerHTML;
//                 featuredLogic();
//             })
//             .catch(error => {
//                 console.error("Error: ", error);
//             });
//     }
//     else {
//         fetch('all.html')
//             .then(fetched_page => {
//                 if(!fetched_page.ok) throw new Error('Failed to fetch featured.html');
//                 else return fetched_page.text();
//             })
//             .then(page_html_text => {
//                 const parser = new DOMParser();
//                 const all_html = parser.parseFromString(page_html_text, 'text/html');

//                 const index_main = all_html.querySelector('main');
//                 console.log(index_main);
//                 main_html.innerHTML = index_main.innerHTML;
//                 indexLogic();
//             })
//             .catch(error => {
//                 console.error("Error: ", error);
//             });    
//     }
// }

// loadPage(false);