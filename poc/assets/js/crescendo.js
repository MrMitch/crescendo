/**
 * crescendo
 */

(function ($) {

    var template = '<div class="crescendo-player"> \
        <img class="crescendo-cover" src="" alt=""> \
        <div class="crescendo-content"> \
            <div class="crescendo-infos"> \
                <h1 class="crescendo-title"></h1>\
                <p class="crescendo-desc">\
                    <span class="crescendo-artist"></span> - <span class="crescendo-album"></span>,\
                    <span>on <a class="crescendo-source" href="#"></a></span>\
                </p>\
            </div>\
            <div class="crescendo-controls">\
                <ul class="crescendo-buttons">\
                    <li class="crescendo-btn-play"><div aria-hidden="true" data-icon="%"></div></li>\
                    <li class="crescendo-btn-stop"><div aria-hidden="true" data-icon="*"></div></li>\
                    <li class="crescendo-btn-repeat"><div aria-hidden="true" data-icon="\'"></div></li>\
                    <li class="crescendo-btn-volume"><div aria-hidden="true" data-icon=","></div></li>\
                </ul>\
                <div class="crescendo-progress"></div>\
                <div class="crescendo-time">\
                    <span class="crescendo-total-time"></span>\
                    <span class="crescendo-time-remaining"></span>\
                </div>\
            </div>\
        </div>\
        <audio class="crescendo-audio" controls="controls" preload="auto"></audio>\
    </div>';

    $.widget('mrmitch.crescendo',
        {
            //Default Options
            options: {
                autoPlay: false,
                volume: 70,
                //endPoint: 'crescendo.html', // the player template
                buttons: {
                    play: true,
                    stop: true,
                    loop: false,
                    volume: true
                },
                song: null
            },

            elements: {
                audio: null,
                player: null,
                title: null,
                artist: null,
                album: null,
                source: null
            },

            data: {
                loaded: false,
                song: null,
                playing: false,
                types: {
                    mp3: 'audio/mp3',
                    ogg: 'audio/ogg',
                    wav: 'audio/x-wav'
                }
            },

            _create:function () {
                var crescendo = this;
                var elem = crescendo.element;
                var player = $(template).addClass(elem.attr('class')).attr('id', elem.id);

                crescendo.elements.slider = player.find('.crescendo-progress').slider({
                    range: 'min',
                    value: 0,
                    min: 0,
                    max: 0,
                    slide: function(event, ui) {
                        //$( "#amount" ).val( "$" + ui.value );
                    }
                });

                crescendo.elements.title = player.find('.crescendo-title');
                crescendo.elements.cover = player.find('.crescendo-cover');
                crescendo.elements.artist = player.find('.crescendo-artist');
                crescendo.elements.album = player.find('.crescendo-album');
                crescendo.elements.source = player.find('.crescendo-source');
                crescendo.elements.audio = player.find('.crescendo-audio').eq(0);
                crescendo.elements.player = player.find('.crescendo-audio').get(0);

                if(crescendo.options.autoPlay)
                {
                    crescendo.elements.audio.attr('autoplay', true);
                }

                if(crescendo.options.song)
                {
                    crescendo.load(crescendo.options.song);
                }


                elem.after(player).detach().remove();

                crescendo._bindEvents();
            },


            // Called each time the widget is called without arguments
            _init:function () {

            },

            _bindEvents:function () {

            },

            load: function() {

                if(arguments.length == 0)
                {
                    return null;
                }

                if(arguments.length == 1)
                {
                    this._loadSongObject(arguments[0])
                }
                else
                {
                    this._loadFromHost(arguments[0], arguments[1]);
                }

                if(this.data.loaded && this.options.autoPlay)
                {
                    this.play();
                }

            },
            _loadSongObject: function(songInfo) {

                var elements = this.elements;

                this.data.loaded = false;

                if(songInfo.files)
                {
                    elements.title.text(songInfo.title || 'Unknown song');
                    elements.artist.text(songInfo.artist || 'Unknown artist');
                    elements.album.text(songInfo.album || 'Unknown album');
                    elements.cover.attr('src', songInfo.cover || '');
                    elements.cover.attr('alt',  elements.artist.text() + ' - ' + elements.album.text());
                    elements.source.text(songInfo.source || 'Unknown source');
                    elements.source.attr('href', songInfo.uri || '#');

                    elements.audio.children('source').remove();
                    for(var i in songInfo.files)
                    {
                        elements.audio.append($('<source />', {
                            src: songInfo.files[i],
                            type: this.data.types[i]
                        }));
                    }

                    this.data.song = songInfo;
                    this.data.loaded = true;
                }
                else
                {
                    console.log('no audio file to play');
                }
            },
            _loadFromHost: function(){},

            play: function(){
                this.elements.player.play();

            },
            pause: function(){
                this.elements.player.pause();
            },
            stop: function(){
                this.elements.player.pause();
            },
            seek: function(){},
            loop: function(activate){},
            setVolume: function(){},
            search: function(){},

            //Destructor
            destroy:function () {

            }
        }
    );
})(jQuery);