let html = `<div class="error">
    <div class="error__ico"></div>
    <div class="error__body">
        <div class="error__title">{title}</div>
        <div class="error__text">{text}</div>
    </div>
</div>

<div class="torrent-error noconnect">
    <div>
        <div>#{torent_nohash_reasons}</div>
        <ul>
            <li>#{torrent_error_ping_format}</li>
            <li>#{torent_nohash_reason_two}: <code>{echo}</code></li>
        </ul>
    </div>

    <div>
        <div>#{torent_nohash_do}</div>
        <ul>
            <li>#{torrent_error_matrix_required}</li>
        </ul>
    </div>

    <div>
        <div>#{torrent_error_how_check}</div>
        <ul>
            <li>#{torrent_error_open_echo}</li>
            <li>#{torrent_error_matrix_in_reply}</li>
        </ul>
    </div>
</div>`

export default html