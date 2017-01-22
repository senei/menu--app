(function(vue, window, document) {
  //
  var _hash = window.location.hash.substring(2).split('/');
  //
  var _current = JSON.parse(sessionStorage.getItem('current'));
  var _today = JSON.parse(sessionStorage.getItem('today'));
  //
  // var _today = {
  // 	'week': 2,
  // 	'year': 2017,
  // 	'day': 0
  // }
  // var _current = {
  // 	'week': 2,
  // 	'year': 2017,
  // 	'day': 0
  // }
  //
  var _user = JSON.parse(sessionStorage.getItem('user'));

  //
  if (_current == null || _today == null) {
    location.href = '/#';
  } else {
    var _menu = { "breakfast": " -- breakfast -- ", "lunch": " -- lunch -- ", "tea": " -- tea -- ", "year": _current.year, "week": _current.week, "day": _current.day, "vendorId": _user.id }
    var _mainVue = new Vue({
      el: '#main',
      data: {
        today: _today,
        current: _current,
        user: _user,
        form: {
          wallet: 0,
          menus: [ 0,1,1,1,1,1 ]
        },
        sidebar: {
          index: true,
          orders: '',
          menus: '',
          clients: ''
        },
        orders: {
          sum: [],
          set: [],
          diners: [],
          users: []
        },
        menus: {},
        users: {
          set: [],
          diners: [],
          selected: ''
        },
        nvi: [
          './#/orders/' + _current.week + '/1',
          './#/orders/' + _current.week + '/2',
          './#/orders/' + _current.week + '/3',
          './#/orders/' + _current.week + '/4',
          './#/orders/' + _current.week + '/5'
        ],
        hash: _hash,
        menus: [0, _menu,_menu,_menu,_menu,_menu ],
        price: {}

      },
      beforeMount: function() {


        if (_hash[0].indexOf('menus') != -1) {
          this.sidebar.index = false;
          this.sidebar.menus = 'pure-menu-selected';
          //
          if (_hash.length > 1 && _hash[1]=='next')
          	this.current.week += 1; 
          else {
            if (this.today.day > 0) this.form.menus[1] = 0;
            
            if (this.today.day > 1) this.form.menus[2] = 0;
            
            if (this.today.day > 2) this.form.menus[3] = 0;
            
            if (this.today.day > 3) this.form.menus[4] = 0;
            
            if (this.today.day > 5) this.form.menus[5] = 0;
          }
          // list curent menu and links to next
          // form menus classes
          
          //
          this.$http.get('/api/menu-prices/findOne?filter[where][year]=' + this.current.year + '&filter[where][week][lt]=' + this.current.week + '&filter[order]=created_at DESC').then(
              function(sucess) {
                
                var _price = {};  
                _price.sum        = sucess.body.sum;
                _price.breakfast  = sucess.body.breakfast;
                _price.lunch      = sucess.body.lunch;
                _price.tea        = sucess.body.tea;

                this.price        = _price.sum+"="+_price.breakfast+"+"+_price.lunch+"+"+_price.tea;
                this.menus[0]     = _price;
                
                this.$forceUpdate();
                  
              }, function(error) {}
          )
          this.$http.get('/api/menus?filter[where][year]=' + this.current.year + '&filter[where][week]=' + this.current.week + '&filter[order]=day ASC').then(
            function(sucess) {
                var _menus_1 = sucess.body.filter(function(menu) {
                    if (menu.day == 1) return menu;
                });
                if (_menus_1.length > 0) this.menus[1] = _menus_1[0];
                if (!this.menus[1].info) this.menus[1].info = '';

                var _menus_2 = sucess.body.filter(function(menu) {
                    if (menu.day == 2) return menu;
                });
                if (_menus_2.length > 0) this.menus[2] = _menus_2[0];
                if (!this.menus[2].info) this.menus[2].info = '';

                var _menus_3 = sucess.body.filter(function(menu) {
                    if (menu.day == 3) return menu;
                });
                if (_menus_3.length > 0) this.menus[3] = _menus_3[0];
                if (!this.menus[3].info) this.menus[3].info = '';
                
                var _menus_4 = sucess.body.filter(function(menu) {
                    if (menu.day == 4) return menu;
                });
                if (_menus_4.length > 0) this.menus[4] = _menus_4[0];
                if (!this.menus[4].info) this.menus[4].info = '';
                
                var _menus_5 = sucess.body.filter(function(menu) {
                    if (menu.day == 5) return menu;
                });
                if (_menus_5.length > 0) this.menus[5] = _menus_5[0];
                if (!this.menus[5].info) this.menus[5].info = '';
                // console.log(this.menus.length)
                this.$forceUpdate();

            }, function(error) {
              
            }
          );  
        }

        if (_hash[0].indexOf('clients') != -1) {
          this.sidebar.index = false;
          this.sidebar.clients = 'pure-menu-selected';
          if (_hash.length > 1)
            this.users.selected = _hash[1];

          //
          // list all clients update there wolets
          this.$http.get('/api/users?filter[where][realm]=C').then(
            function(sucess) {
              this.users.set = sucess.body;
              var _diners = [];
              for (var i = 0; i < sucess.body.length; i++) {
                this.$http.get('/api/users/' + sucess.body[i].id + '/diners').then(
                  function(sucess) {
                    _diners[sucess.body[0].userId] = sucess.body;
                    this.$forceUpdate();
                  }, function(error) {}
                )
              }

              this.users.diners = _diners;
              this.$forceUpdate();


            }, function(error) {}
          )


        }

        if (_hash[0].indexOf('order') != -1) {
          this.sidebar.index = false;
          this.sidebar.orders = 'pure-menu-selected';
          //
          // list all clients update there wolets
        }

        if (this.sidebar.index || _hash[0].indexOf('order') != -1) {

          // orders for curent week
		  var _time = new Date().getTime();
          this.$http.get('/api/orders?filter[where][week]=' + _current.week + '&filter[order]=created_at DESC&at='+_time).then(
            function(sucess) {
              var _dinerId = [],
                _return = [],
                _diners = [],
                _users = [],
                _arr = [],
                _sum = [1, [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0]
                ];

              for (var i = 0; i < sucess.body.length; i++) {
                if (_dinerId.indexOf(sucess.body[i].dinerId) == -1) {
                  _dinerId.push(sucess.body[i].dinerId);
                  _arr = sucess.body[i].set;

                  for (var j = 1; j < 6; j++) {
                    if (_arr[j][0]) {
                      _arr[j][1] = _arr[j][2] = _arr[j][3] = 1;
                      _arr[j][0] = 0;
                    }

                    _sum[j][1] += _arr[j][1];
                    _sum[j][2] += _arr[j][2];
                    _sum[j][3] += _arr[j][3];
                  }
                  _return.push(_arr);
                }
              }
              for (var i = 0; i < _dinerId.length; i++) {
                this.$http.get('/api/diners/' + _dinerId[i]).then(
                  function(sucess) {
                    _diners.push(sucess.body);
                  }, function(error) {}
                )
                this.$http.get('/api/diners/' + _dinerId[i] + '/user?at='+_time).then(
                  function(sucess) {
                    _users.push(sucess.body);
                  }, function(error) {}
                )
              }

              this.orders.sum = _sum;
              this.orders.set = _return;
              this.orders.diners = _diners;
              this.orders.users = _users;

              this.$forceUpdate();

            }, function(error) {}
          )
        }
      },
      created: function() {},
      methods: {
        menuUpdate: function(menus, e) {

          var _price            = {};
              _price.breakfast  = menus[0].breakfast;
              _price.lunch      = menus[0].lunch;
              _price.tea        = menus[0].tea;
              _price.sum        = menus[0].sum;
              _price.vendorId   = this.user.id;
              _price.year       = this.current.year;
              _price.week       = this.current.week - 1;
              _price.created_at = new Date().getTime();
          //
          var _token = menus[0].sum+'='+menus[0].breakfast+'+'+menus[0].lunch+'+'+menus[0].tea;
          if( this.price!=_token ) {
            this.$http.post('/api/menu-prices/?access_token=' + this.user.accessToken,
              JSON.stringify(_price)).then(
              function(sucess) {
                this.price = sucess.data;
              }, function(error) {
                location.href = '/user/#/logout';
              }
            );
          }
          // day - 1
          for (var i = 1; i < 6; i++) {
            if(this.menus[i].id != ''){
              this.$http.put('/api/menus/'+this.menus[i].id+'?access_token=' + this.user.accessToken,
                JSON.stringify(this.menus[i])).then(
                function(sucess) { this.menus[i] = sucess.data;
                  
                }, function(error) { location.href = '/user/#/logout'; 
                }
              );
            } else {
              this.menus[i].id = null;
              this.menus[i].year = this.current.year;
              this.menus[i].week = this.current.week;
              this.menus[i].day = i;
              this.$http.post('/api/menus/?access_token=' + this.user.accessToken,
                JSON.stringify(this.menus[i])).then(
                function(sucess) { this.menus[i] = sucess.data;

                }, function(error) { location.href = '/user/#/logout'; 
                }
              );
            }
          }
        },
        details: function(user, e) {
          location.href = './#/clients/' + e.currentTarget.dataset.key;
        },
        cashIn: function(user, e) {
          if (!user.wallet) user.wallet = 0;
          user.wallet += this.form.wallet;

          this.$http.patch('/api/users/' + user.id + '?access_token=' + this.user.accessToken,
            JSON.stringify({
              "wallet": user.wallet
            })).then(
            function(sucess) {
              this.form.wallet = 0;
            }, function(error) {
              location.href = '/user/#/logout';
            }
          );

          this.$forceUpdate();
        }
      }
    });
  }
})(Vue, window, document);