/*======================================================
************   Searchbar   ************
======================================================*/
app.initSearchbar = function (pageContainer) {
    pageContainer = $(pageContainer);
    var searchbar = pageContainer.find('.searchbar');
    if (searchbar.length === 0) return;
    var searchbarOverlay = pageContainer.hasClass('navbar') ? $('.searchbar-overlay') : pageContainer.find('.searchbar-overlay');
    var input = searchbar.find('input[type="search"]');
    var clear = searchbar.find('.searchbar-clear');
    var cancel = searchbar.find('.searchbar-cancel');
    var searchList = $(searchbar.data('search-list'));
    var searchIn = searchbar.data('search-in');
    var searchBy = searchbar.data('search-by');
    var found = $('.searchbar-found');
    var notFound = $('.searchbar-not-found');

    // Cancel button
    var cancelWidth, cancelMarginProp = app.rtl ? 'margin-left' : 'margin-right';
    if (cancel.length > 0) {
        cancelWidth = cancel.width();

        cancel.css(cancelMarginProp, - cancelWidth + 'px');
    }

    // Handlers
    function disableSearchbar() {
        input.val('').trigger('change');
        searchbar.removeClass('searchbar-active searchbar-not-empty');
        if (cancel.length > 0) cancel.css(cancelMarginProp, - cancelWidth + 'px');
        
        if (searchList) searchbarOverlay.removeClass('searchbar-overlay-active');
        if (app.device.ios) {
            setTimeout(function () {
                input.blur();
            }, 400);
        }
        else {
            input.blur();
        }
    }

    // Activate
    function enableSearchbar() {
        if (app.device.ios) {
            setTimeout(function () {
                if (searchList && !searchbar.hasClass('searchbar-active')) searchbarOverlay.addClass('searchbar-overlay-active');
                searchbar.addClass('searchbar-active');
                if (cancel.length > 0) cancel.css(cancelMarginProp, '0px');

            }, 400);
        }
        else {
            if (searchList && !searchbar.hasClass('searchbar-active')) searchbarOverlay.addClass('searchbar-overlay-active');
            searchbar.addClass('searchbar-active');
            if (cancel.length > 0) cancel.css(cancelMarginProp, '0px');
        }
    }

    // Clear
    function clearSearchbar() {
        input.val('').trigger('change');
    }

    // Change
    function searchValue() {
        setTimeout(function () {
            var value = input.val().trim();
            if (value.length === 0) {
                searchbar.removeClass('searchbar-not-empty');
                if (searchList && searchbar.hasClass('searchbar-active')) searchbarOverlay.addClass('searchbar-overlay-active');
            }
            else {
                searchbar.addClass('searchbar-not-empty');
                if (searchList && searchbar.hasClass('searchbar-active')) searchbarOverlay.removeClass('searchbar-overlay-active');
            }
            if (searchList.length > 0 && searchIn) search(value);
        }, 0);
    }

    //Prevent submit
    function preventSubmit(e) {
        e.preventDefault();
    }

    function attachEvents(destroy) {
        var method = destroy ? 'off' : 'on';
        searchbar[method]('submit', preventSubmit);
        cancel[method]('click', disableSearchbar);
        searchbarOverlay[method]('click', disableSearchbar);
        input[method]('focus', enableSearchbar);
        input[method]('change keydown keypress keyup', searchValue);
        clear[method]('click', clearSearchbar);
    }
    function detachEvents() {
        attachEvents(true);
    }
    searchbar[0].f7DestroySearchbar = detachEvents;

    // Attach events
    attachEvents();

    // Search
    function search(query) {
        var values = query.trim().toLowerCase().split(' ');
        searchList.find('li').css('display', '');
        var foundItems = [];
        searchList.find('li').each(function (index, el) {
            el = $(el);
            var compareWithEl = el.find(searchIn);
            if (compareWithEl.length === 0) return;
            var compareWith;
            compareWith = compareWithEl.text().trim().toLowerCase();
            var wordsMatch = 0;
            for (var i = 0; i < values.length; i++) {
                if (compareWith.indexOf(values[i]) >= 0) wordsMatch++;
            }
            if (wordsMatch !== values.length) {
                el.hide();
            }
            else {
                foundItems.push(el[0]);
            }
        });

        searchList.trigger('search', {query: query, foundItems: foundItems});

        if (foundItems.length === 0) {
            notFound.show();
            found.hide();
        }
        else {
            notFound.hide();
            found.show();
        }
    }

    // Destroy on page remove
    function pageBeforeRemove() {
        detachEvents();
        pageContainer.off('pageBeforeRemove', pageBeforeRemove);
    }
    if (pageContainer.hasClass('page')) {
        pageContainer.on('pageBeforeRemove', pageBeforeRemove);
    }
        
};
app.destroySearchbar = function (searchbar) {
    searchbar = $(searchbar);
    if (searchbar.length === 0) return;
    if (searchbar[0].f7DestroySearchbar) searchbar[0].f7DestroySearchbar();
};
