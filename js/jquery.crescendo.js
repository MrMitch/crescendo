/**
 * crescendo
 */

(function ($, Math) {
    var template = '\
        <div class="crescendo-wait-screen"></div>\
        <div class="crescendo-interface">\
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
                    <ul class="crescendo-buttons"></ul>\
                    <div class="crescendo-progress"></div>\
                    <div class="crescendo-time">\
                        <span class="crescendo-current"></span>\
                        <span class="crescendo-remaining"></span>\
                    </div>\
                </div>\
            </div>\
        </div>';


    var buttonsIcons = {
        play: '%',
        pause: '&',
        stop: '*',
        loop: "'",
        volume: ','

    };

    var buttonsTemplates = {
        play: '<li class="crescendo-btn-play" aria-hidden="true" data-icon=""></li>',
        stop: '<li class="crescendo-btn-stop" aria-hidden="true" data-icon=""></li>',
        loop: '<li class="crescendo-btn-loop" aria-hidden="true" data-icon=""></li>',
        volume: '<li class="crescendo-btn-volume" aria-hidden="true" data-icon=""></li>'
    };

    $.widget('mrmitch.crescendo',
        {
            //Default Options
            options: {
                autoPlay: false,
                volume: 70,
                slideSpeed: 500,
                width: 390,
                buttons: {
                    play: true,
                    stop: true,
                    loop: false,
                    volume: true
                },
                song: null
            },

            _create:function ()
            {
                var crescendo = this, filteredWidth = this._filterWidth(crescendo.options.width);
                var elem = crescendo.element.addClass('crescendo-player');
                elem.html(elem.html() + template);

                crescendo.elements = {
                    slider: elem.find('.crescendo-progress'),
                    audio: $('<audio />', {'class': 'crescendo-audio',preload: 'metadata'}).appendTo(elem.find('.crescendo-interface')),
                    current: elem.find('.crescendo-current'),
                    remaining: elem.find('.crescendo-remaining')
                };

                crescendo.elements.player = crescendo.elements.audio.get(0);

                crescendo.data = {
                    loaded: false,
                    firstLoad: true,
                    song: null,
                    playing: false,
                    sliding: false,
                    types: {
                        mp3: 'audio/mpeg',
                        ogg: 'audio/ogg',
                        oga: 'audio/ogg',
                        flac: 'audio/flac',
                        wav: 'audio/x-wav'
                    }
                };

                if(filteredWidth[1] == 'px' && filteredWidth[0] <= 320)
                {
                    elem.find('.crescendo-cover').hide();
                }

                elem.css('width', filteredWidth[0] + filteredWidth[1]);

                var buttonsList = elem.find('.crescendo-buttons');

                for(var i in crescendo.options.buttons)
                {
                    if(crescendo.options.buttons[i])
                    {
                        buttonsList.append($(buttonsTemplates[i]).attr('data-icon', buttonsIcons[i]));
                    }
                }

                if(crescendo.options.autoPlay)
                {
                    crescendo.elements.audio.attr('autoplay', true);
                }

                if(crescendo.options.song)
                {
                    crescendo.load(crescendo.options.song);
                }

                crescendo._bindClickEvents();
                crescendo._bindAudioEvents();
            },


            // Called each time the widget is called without arguments
            _init:function () {

            },

            _filterWidth: function(width){
                var unit, matches;

                if(typeof width == 'number'){
                    unit = 'px';
                }
                else
                {
                    if(typeof width == 'string')
                    {
                        matches = /(\d+(\.\d+)*)?(auto|px|em|pt|%)?/g.exec(width);
                        width = +matches[1];
                        unit = (!!width) ? matches[3] || 'px' : '';
                    }
                    else
                    {
                        width = 320;
                        unit = 'px';
                    }
                }

                return [width, unit];
            },

            _bindClickEvents:function ()
            {
                var crescendo = this, elem = crescendo.element;

                if(crescendo.options.buttons.stop)
                {
                    elem.on('click.crescendo', '.crescendo-btn-stop', function(event){
                        crescendo.stop();
                    });
                }

                if(this.options.buttons.play)
                {
                    elem.on('click.crescendo', '.crescendo-btn-play', function(event) {
                        if(crescendo.elements.player.paused)
                        {
                            crescendo.play();
                        }
                        else
                        {
                            crescendo.pause();
                        }
                    });
                }

                if(this.options.buttons.loop)
                {
                    elem.on('click', '.crescendo-btn-loop', function(event) {
                        $(this).toggleClass('crescendo-btn-activated');
                    });
                }
            },

            _bindAudioEvents: function()
            {
                var crescendo = this;

                crescendo.elements.audio
                    .on('loadedmetadata', function(event){
                        var elems = crescendo.elements,
                            data = crescendo.data,
                            duration = Math.floor(elems.player.duration);

                        crescendo.data.song.duration = duration;
                        elems.current.text('0:00');
                        elems.remaining.text('- ' + crescendo._secondsToTimeSTring(duration));

                        elems.slider.slider({
                            range: 'min',
                            value: 0,
                            min: 0,
                            max: duration,
                            start: function(){
                                crescendo.data.sliding = true;
                            },
                            slide: function(event, ui) {
                                crescendo._updateTimeInfo(ui.value);
                            },
                            stop: function(event, ui){
                                crescendo.data.sliding = false;
                                crescendo.seek(ui.value);
                            }
                        });

                        if(data.firstLoad)
                        {
                            crescendo.element.find('.crescendo-wait-screen, .crescendo-interface')
                                .slideToggle(crescendo.options.slideSpeed);
                            data.firstLoad = false;
                        }
                        if(crescendo.options.autoPlay && crescendo.elements.player.paused)
                        {
                            this.play();
                        }

                    })
                    .on('timeupdate', function(event) {
                        var elems = crescendo.elements,
                            current = Math.floor(elems.player.currentTime);

                        if(!crescendo.data.sliding)
                        {
                            crescendo._updateTimeInfo(current);
                            elems.slider.slider('value', current);
                        }
                    })
                    .on('play pause',function(event){
                        crescendo.element.find('.crescendo-btn-play').attr('data-icon',
                            buttonsIcons[event.type == 'pause' ? 'play' : 'pause']);
                    })
                    .on('ended', function(){
                        if(!crescendo.data.sliding)
                        {
                            crescendo._updateTimeInfo(0);
                            crescendo.elements.slider.slider('value', 0);
                        }
                    });
            },

            /**
             * Converts an amount of second to a 'minutes:seconds' string.
             * @param {Number} seconds
             * @return {String}
             * @private
             */
            _secondsToTimeSTring: function(seconds){
                seconds = Math.floor(seconds);
                var m = Math.floor(seconds/60);
                var s = seconds - 60*m;

                return m + ':' + (s<10 ? ('0' + s) : s);
            },

            _updateTimeInfo: function(current) {
                current = Math.floor(current);
                var remaining = this.data.song.duration - current, elems = this.elements;

                elems.current.text(this._secondsToTimeSTring(current));
                elems.remaining.text('- ' + this._secondsToTimeSTring(remaining));
            },

            load: function() {
                var crescendo = this,
                    data = crescendo.data;

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
            },

            _loadSongObject: function(songInfo) {

                var elements = this.elements, elem = this.element,
                    audio, player, canPlay, artist, album;

                this.data.loaded = false;

                if(songInfo.files)
                {
                    artist = elem.find('.crescendo-artist').text(songInfo.artist || 'Unknown artist');
                    album = elem.find('.crescendo-album').text(songInfo.album || 'Unknown album');

                    elem.find('.crescendo-title').text(songInfo.title || 'Unknown song');

                    elem.find('.crescendo-cover')
                        .attr('src', songInfo.cover || '')
                        .attr('alt',  artist.text() + ' - ' + album.text());

                    elem.find('.crescendo-source')
                        .attr('href', songInfo.uri || '#')
                        .text(songInfo.source || 'Unknown source');

                    audio = elements.audio.children('source').remove().end();
                    player = elements.player;
                    for(var i in songInfo.files)
                    {
                        canPlay = player.canPlayType(this.data.types[i]);
                        if(canPlay == 'maybe' || canPlay == 'probably')
                        {
                            audio.append($('<source />', {
                                src: songInfo.files[i],
                                type: this.data.types[i]
                            }));
                        }
                    }

                    this.data.song = songInfo;
                    this.data.loaded = true;
                }
                else
                {
                    console.error('no audio file to play');
                }
            },
            _loadFromHost: function(){},

            play: function()
            {
                var player = this.elements.player

                if(player.preload != 'auto')
                {
                    player.preload = 'auto';
                }

                player.play();
            },

            pause: function()
            {
                this.elements.player.pause();
            },

            stop: function()
            {
                var player = this.elements.player;
                player.pause();
                player.currentTime = 0;
            },

            seek: function(seconds)
            {
                var player = this.elements.player;
                if(!this.data.loaded)
                {
                    return false;
                }

                seconds = (+seconds);

                if(seconds < 0)
                {
                    seconds = 0;
                }
                else
                {
                    if(seconds > player.duration)
                    {
                        seconds = player.duration;
                    }
                }

                player.currentTime = seconds;

                return true;
            },

            loop: function(activate){

            },
            setVolume: function(value)
            {
                value = (+value);

                if(value < 0)
                {
                    value = 0;
                }
                else
                {
                    if(value > 100)
                    {
                        value = 100;
                    }
                }


                value = Math.round(value)/100;

                this.elements.player.volume = value;
            },

            //Destructor
            destroy:function () {

            },

            getData: function(){
                return {
                    options: this.options,
                    elements: this.elements,
                    data: this.data
                };
            }
        }
    );
})(jQuery, Math);