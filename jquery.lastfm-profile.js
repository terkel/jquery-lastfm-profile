/*
 * jQuery Last.fm Profile Plugin v0.9.1
 * http://terkel.jp/archives/2011/07/jquery-lastfm-profile-plugin/
 * 
 * Copyright (c) 2011 Takeru Suzuki
 * Dual licensed under the MIT and GPL licenses.
 * 
 * Requires: jQuery 1.4.3+
 */
(function($) {

    $.fn.loadLastfmProfile = function (options) {
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
                    errorMessage:   $this.data('lastfm-error-message'),
                    contentBefore:  $this.data('lastfm-content-before'),
                    contentAfter:   $this.data('lastfm-content-after')
                },
                opts = $.extend({}, $.fn.loadLastfmProfile.defaults, options, customData);
            $this[0].innerHTML = '<p class="loading">' + opts.loadingMessage + '</p>';
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'http://ws.audioscrobbler.com/2.0/?callback=?',
                data: {
                    api_key: 'c1e773908a041598767406c5d32c022e',
                    format: 'json',
                    user: opts.user,
                    method: function () {
                       if (opts.method === 'NowPlaying') {
                           return 'user.getRecentTracks';
                       } else {
                           return 'user.get' + opts.method;
                       }
                    },
                    period: opts.period,
                    limit: opts.limit
                },
                success: function (data) {
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
                    html[html.length] = opts.contentBefore;
                    html[html.length] = (nowPlaying)? '<ul>': '<ol>';
                    $.each(items, function (i, item) {
                        var linkTitle,
                            imageSrc = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_artist_' + opts.imageSize + '.png',
                            imageAlt,
                            artistName,
                            artistUrl,
                            playcountUrl;
                        if (opts.image) {
                            if (item.image) {
                                $.each(item.image, function (j, image) {
                                    if (image.size === opts.imageSize) {
                                        
                                        imageSrc = (opts.imageSquare)? image['#text'].replace(/(http:\/\/userserve-ak.last.fm\/serve\/(34|64|126))\//, '$1s/'): image['#text'];
                                    }
                                });
                            }
                            imageAlt = (opts.text)?            '':
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
                        html[html.length] = '<li>';
                        html[html.length] =     '<a href="' + item.url + '"';
                        html[html.length] =         (linkTitle)? ' title="' + linkTitle + '"': '';
                        html[html.length] =     ' class="item" target="_blank">';
                        html[html.length] =         (opts.image)? '<img src="' + imageSrc + '" alt="' + imageAlt + '" class="photo">': '';
                        html[html.length] =         (opts.text)? '<span class="name">' + item.name + '</span>': '';
                        html[html.length] =     '</a>';
                        html[html.length] =     (opts.text && item.artist)? ' &#8211; <a href="' + artistUrl + '" class="artist" target="_blank">' + artistName + '</a>': '';
                        html[html.length] =     (playcountUrl)? ' <span class="playcount">(<a href="' + playcountUrl + '" target="_blank">' + item.playcount + ' plays</a>)</span>': '';
                        html[html.length] = '</li>';
                    });
                    html[html.length] = (nowPlaying)? '</ul>': '</ol>';
                    html[html.length] = opts.contentAfter;
                    $this[0].innerHTML = html.join('');
                },
                error: function () {
                    $this[0].innerHTML = '<p class="error">' + opts.errorMessage + '</p>';
                }
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
        errorMessage:   'Failed to load data.',
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
