(function(vue, window, document) {
    Date.prototype.getWeek = function() {
        var target = new Date(this.valueOf());
        var dayNr = (this.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000  
    };
    //  
    Date.prototype.firstDayOfWeek = function(year, week) {
        var j1 = new Date(year, 0, 10, 12, 0, 0),
            j2 = new Date(year, 0, 4, 12, 0, 0),
            mon1 = j2.getTime() - j1.getDay() * 86400000;
        return new Date(mon1 + ((week - 1) * 7 + 3) * 86400000);
    };
    //
    var _hash = window.location.hash;
    var _today = new Date();

    //
    if (_hash.length > 0 && _hash.indexOf('-') > 0) {
        _today = new Date(window.location.hash.substring(1));
    } else {
        _hash = _hash.substring(2).split('/');
        if (_hash[0] > 100 && _hash[1] < 60) {
            _today = _today.firstDayOfWeek(_hash[0], _hash[1]);
        } else if (_hash[0] > 0 && _hash[0] < 60) {
            _today = _today.firstDayOfWeek(_today.getFullYear(), _hash[0]);
        }
    }
    
    var _week = _today.getWeek();
    if (_today.getDay() == 0 || _today.getDay() == 6) {
        _week = _today.getWeek() + 1;
    }

    var _current = {
        'week': _week,
        'year': _today.getFullYear(),
        'day': _today.getDay()
    }

    _today = new Date();
    _week = _today.getWeek();
    var _day =_today.getDay();
    if (_day == 0 || _day == 6) {
        _week = _today.getWeek() + 1;
        _day = 0;
    }
    var _days = [
        (_current.week > _week) ? '' : 'disabled',
        (_current.week > _week || (_current.week == _week && 1 > _day)) ? '' : 'disabled',
        (_current.week > _week || (_current.week == _week && 2 > _day)) ? '' : 'disabled',
        (_current.week > _week || (_current.week == _week && 3 > _day)) ? '' : 'disabled',
        (_current.week > _week || (_current.week == _week && 4 > _day)) ? '' : 'disabled',
        (_current.week > _week || (_current.week == _week && 5 > _day)) ? '' : 'disabled'
    ]
    
    var _mainVue = new Vue({
        el: '#main',
        data: {
            today: {
                'week': _week,
                'year': _today.getFullYear(),
                'day': _today.getDay()
            },
            current: _current,
            form: {
                day: _days
            },
            menus: []
        },
        beforeMount: function() {
            // console.log(this.form.day)
            // menu
            this.$http.get('/api/menus?filter[where][year]=' + this.current.year + '&filter[where][week]=' + this.current.week + '&filter[order]=day ASC').then(
                function(sucess) {
                    var _menus_1 = sucess.body.filter(function(menu) {
                        if (menu.day == 1) return menu;
                    });
                    if (_menus_1.length > 0) this.menus[1] = _menus_1[0];
                    var _menus_2 = sucess.body.filter(function(menu) {
                        if (menu.day == 2) return menu;
                    });
                    if (_menus_2.length > 0) this.menus[2] = _menus_2[0];
                    var _menus_3 = sucess.body.filter(function(menu) {
                        if (menu.day == 3) return menu;
                    });
                    if (_menus_3.length > 0) this.menus[3] = _menus_3[0];
                    var _menus_4 = sucess.body.filter(function(menu) {
                        if (menu.day == 4) return menu;
                    });
                    if (_menus_4.length > 0) this.menus[4] = _menus_4[0];
                    var _menus_5 = sucess.body.filter(function(menu) {
                        if (menu.day == 5) return menu;
                    });
                    if (_menus_5.length > 0) this.menus[5] = _menus_5[0];
                    // console.log(this.menus.length)
                    this.$forceUpdate();

                    sessionStorage.setItem('current', JSON.stringify(this.current));
                    sessionStorage.setItem('today', JSON.stringify(this.today));
                    sessionStorage.setItem('menus', JSON.stringify(this.menus));
                }, function(error) {
                    console.log(error)
                }
            );
        }

    });

})(Vue, window, document);
