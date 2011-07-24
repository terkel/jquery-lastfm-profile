/*
 * jQuery Last.fm Profile Plugin v0.9
 * http://terkel.jp/archives/2011/07/jquery-lastfm-profile-plugin/
 * 
 * Copyright (c) 2011 Takeru Suzuki
 * Dual licensed under the MIT and GPL licenses.
 * 
 * Requires: jQuery 1.4.3+
 */
(function($) {
    $.fn.loadLastfmProfile = function (options) {
        options = $.extend({}, $.fn.loadLastfmProfile.defaults, options);
        return this.each(function () {
            var $this = $(this),
                customData = {
                    user:           $this.data('lastfm-user'),
                    method:         $this.data('lastfm-method'),
                    period:         $this.data('lastfm-period'),
                    limit:          $this.data('lastfm-limit'),
                    image:          $this.data('lastfm-image'),
                    imageSize:      $this.data('lastfm-image-size'),
                    imageSquare:    $this.data('lastfm-image-square'),
                    text:           $this.data('lastfm-text'),
                    playcount:      $this.data('lastfm-playcount'),
                    loadingMessage: $this.data('lastfm-loading-message'),
                    contentBefore:  $this.data('lastfm-content-before'),
                    contentAfter:   $this.data('lastfm-content-after')
                },
                opts = $.extend({}, options, customData);
            $this[0].innerHTML = '<p class="loading">' + opts.loadingMessage + '</p>';
            $.getJSON('http://ws.audioscrobbler.com/2.0/?callback=?', {
                api_key: 'c1e773908a041598767406c5d32c022e',
                format:  'json',
                user:    opts.user,
                method:  function () {
                             if (opts.method === 'NowPlaying') {
                                 return 'user.getRecentTracks';
                             } else {
                                 return 'user.get' + opts.method;
                             }
                         },
                period:  opts.period,
                limit:   opts.limit
            }, function (data) {
                var items = function () {
                        switch (opts.method) {
                            case 'TopAlbums':
                                return data.topalbums.album;
                                break;
                            case 'TopArtists':
                                return data.topartists.artist;
                                break;
                            case 'TopTracks':
                                return data.toptracks.track;
                                break;
                            case 'RecentTracks':
                            case 'NowPlaying':
                                return data.recenttracks.track;
                                break;
                            default:
                                return '';
                                break;
                        }
                    }(),
                    html = [],
                    h = -1,
                    nowPlaying = false;
                if (!$.isArray(items)) {
                    items = [items];
                }
                if (items[0]['@attr'] && items[0]['@attr'].nowplaying === 'true') {
                    if (opts.method === 'RecentTracks') {
                        items.shift();
                    } else if (opts.method === 'NowPlaying') {
                        items = [items[0]];
                        nowPlaying = true;
                    }
                } else if (opts.method === 'NowPlaying') {
                    $this.empty();
                    return this;
                }
                html[++h] = opts.contentBefore;
                html[++h] = (nowPlaying)? '<ul>': '<ol>';
                $.each(items, function (i, item) {
                    var linkTitle,
                        imageSrc,
                        imageAlt,
                        artistName,
                        artistUrl,
                        playcountUrl;
                    if (opts.image) {
                        if (item.image) {
                            $.each(item.image, function (j, image) {
                                if (image.size === opts.imageSize) {
                                    imageSrc = image['#text'];
                                    if (opts.imageSquare) {
                                        imageSrc = imageSrc.replace(/(http:\/\/userserve-ak.last.fm\/serve\/(34|64|126))\//, '$1s/');
                                    }
                                }
                            });
                        }
                        if (!imageSrc) {
                            imageSrc = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_artist_' + opts.imageSize + '.png';
                        }
                        imageAlt =
                            (opts.text)?            '':
                            (!item.artist)?         item.name.escapeHTML():
                            (item.artist.name)?     item.name.escapeHTML() + ' &#8211; ' + item.artist.name.escapeHTML():
                            (item.artist['#text'])? item.name.escapeHTML() + ' &#8211; ' + item.artist['#text'].escapeHTML():
                            '';
                    }
                    if (opts.text) {
                        if (item.artist) {
                            artistName = (item.artist.name)? item.artist.name: item.artist['#text'];
                            artistUrl = (item.artist.url)? item.artist.url: 'http://www.last.fm/music/' + artistName.replace(/\s/g, '+');
                        }
                    } else {
                        linkTitle = imageAlt;
                    }
                    if (opts.playcount && item.playcount) {
                        playcountUrl = item.url.replace(/^(http:\/\/www\.last\.fm\/)/, '$1user/' + opts.user + '/library/');
                    }
                    html[++h] = '<li>';
                    html[++h] =     '<a href="' + item.url + '"';
                    html[++h] =         (linkTitle)? ' title="' + linkTitle + '"': '';
                    html[++h] =     ' class="item">';
                    html[++h] =         (opts.image)? '<img src="' + imageSrc + '" alt="' + imageAlt + '" class="photo">': '';
                    html[++h] =         (opts.text)? '<span class="name">' + item.name + '</span>': '';
                    html[++h] =     '</a>';
                    html[++h] =     (opts.text && item.artist)? ' &#8211; <a href="' + artistUrl + '" class="artist">' + artistName + '</a>': '';
                    html[++h] =     (playcountUrl)? ' <span class="playcount">(<a href="' + playcountUrl + '">' + item.playcount + ' plays</a>)</span>': '';
                    html[++h] = '</li>';
                });
                html[++h] = (nowPlaying)? '</ul>': '</ol>';
                html[++h] = opts.contentAfter;
                $this[0].innerHTML = html.join('');
            });
        });
    };
    $.fn.loadLastfmProfile.defaults = {
        user:           'LAST.HQ',   // Last.fm username
        method:         'TopAlbums', // TopArtists|TopAlbums|TopTracks|RecentTracks|NowPlaying
        period:         '7day',      // 7day|3month|6month|12month|overall
        limit:          10,          // 1-50
        image:          true,
        imageSize:      'medium',    // small|medium|large
        imageSquare:    true,
        text:           true,
        playcount:      true,
        loadingMessage: 'Loading&#8230;',
        contentBefore:  '',
        contentAfter:   ''
    };
})(jQuery);

// String.escapeHTML()
String.prototype.escapeHTML = function () {
    var pattern = /["&<>]/g,
        entities = {
            '"': '&quot;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
    return function () {
        return this.replace(pattern, function (c) {
            return entities[c];
        });
    };
}();
