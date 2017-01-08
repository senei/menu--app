(function(vue, window, document) {
    // Date.prototype.getWeek = function() {
    //     var target = new Date(this.valueOf());
    //     var dayNr = (this.getDay() + 6) % 7;
    //     target.setDate(target.getDate() - dayNr + 3);
    //     var firstThursday = target.valueOf();
    //     target.setMonth(0, 1);
    //     if (target.getDay() != 4) {
    //         target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    //     }
    //     return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000  
    // };
    // //  
    // Date.prototype.firstDayOfWeek = function(year, week) {
    //     var j1 = new Date(year, 0, 10, 12, 0, 0),
    //         j2 = new Date(year, 0, 4, 12, 0, 0),
    //         mon1 = j2.getTime() - j1.getDay() * 86400000;
    //     return new Date(mon1 + ((week - 1) * 7 + 3) * 86400000);
    // };
    //
    var _hash = window.location.hash.substring(2).split('/');
    //
    var _current = JSON.parse(sessionStorage.getItem('current'));
    var _today = JSON.parse(sessionStorage.getItem('today'));
    var _menus = JSON.parse(sessionStorage.getItem('menus'));
    var _price = JSON.parse(sessionStorage.getItem('menu-price'));
    var _user = JSON.parse(sessionStorage.getItem('user'));

    var _days = [];
    _days[0] = (_current.week > _today.week) ? '' : 'disabled';
    _days[1] = (_current.week > _today.week || (_current.week == _today.week && 1 > _today.day)) ? '' : 'disabled';
    _days[2] = (_current.week > _today.week || (_current.week == _today.week && 2 > _today.day)) ? '' : 'disabled';
    _days[3] = (_current.week > _today.week || (_current.week == _today.week && 3 > _today.day)) ? '' : 'disabled';
    _days[4] = (_current.week > _today.week || (_current.week == _today.week && 4 > _today.day)) ? '' : 'disabled'; 
    _days[5] = (_current.week > _today.week || (_current.week == _today.week && 5 > _today.day)) ? '' : 'disabled';

    var _mainVue = new Vue({
        el: '#main',
        data: {
            today: _today,
            current: _current,
            menus: _menus,
            price: _price,
            user: _user,
            form: {
                login: {
                    user: '',
                    pass: ''
                },
                diner: {
                    name: '',
                    age: '',
                    bio: '',
                    userId: '',
                    canteenId: '584736edf59b78b60afd6661'
                },
                error: {
                    login: '',
                    user: '',
                    email: '',
                    pass: '',
                    diner: {
                        name: '',
                        age: '',
                        bio: ''
                    }
                },
                formId: '',
                user: {
                    username: '',
                    email: '',
                    password: '',
                    phone: '',
                    realm: 'C',
                    wallet: 0
                },
                address: {
                    recipient: '',
                    street: '',
                    locality: 'Poznań',
                    userId: ''
                },
                order: {
                    '1': [0, 0, 0, 0],
                    '2': [0, 0, 0, 0],
                    '3': [0, 0, 0, 0],
                    '4': [0, 0, 0, 0],
                    '5': [0, 0, 0, 0],
                    'sum': 0,
                    'price': [0, 0, 0, 0]
                },
                day: _days
            },
            sidebar: {
                index: true,
                login: '',
                update: '',
                create: ''
            },
            dinersSelected: []
        },
        beforeMount: function() {
            if (_hash[0].indexOf('login') == -1) {
                this.sidebar.login = '';
            }
            if (_hash[0].indexOf('login') != -1) {
                this.sidebar.index = false;
                this.sidebar.login = 'pure-menu-selected';
                if (this.user) {
                    location.href = './#/';
                }
            }
            if (_hash[0].indexOf('logout') != -1) {
                sessionStorage.removeItem('user');
                location.href = '/#/logout';
            }
            if (_hash[0].indexOf('update') != -1) {
                this.sidebar.index = false;

                this.sidebar.update = 'pure-menu-selected';
            }
            if (_hash[0].indexOf('create') != -1) {
                this.sidebar.index = false;
                this.sidebar.create = 'pure-menu-selected';
                this.user = {
                    id: 0
                };
                this.form.user.username = "kliencie";
                this.form.user.email = "test@test.pl";
            } else {
                if (!this.user) {
                    location.href = './#/login';
                    this.user = {
                        id: 0
                    };
                } else if (!this.user.data) {
                    this.$http.get('/api/users/' + this.user.id).then(
                        function(sucess) {
                            this.user.data = sucess.body;
                            this.user.id = this.user.id;
                            this.user.accessToken = this.user.accessToken;
                            sessionStorage.setItem('user', JSON.stringify(this.user));
                            this.$forceUpdate();

                            if (sucess.body.realm == 'V') {
                                location.href = '/vendor/#/';
                            }
                        }, function(error) {}
                    )
                    //
                    this.$http.get('/api/users/' + this.user.id + '/diners').then(
                        function(sucess) {
                            // console.log(sucess);
                            this.user.diners = sucess.body;
                            sessionStorage.setItem('user', JSON.stringify(this.user));
                            this.$forceUpdate();

                        }, function(error) {}
                    )
                    //
                    this.$http.get('/api/users/' + this.user.id + '/address').then(
                        function(sucess) {
                            // console.log(sucess);
                            this.user.address = sucess.body;
                            sessionStorage.setItem('user', JSON.stringify(this.user));
                            this.$forceUpdate();

                        }, function(error) {}
                    )
                    //
                }
                if (this.price == []) {
                    this.$http.get('/api/menu-prices/findOne?filter[where][year]=' + _current.year + '&filter[where][week][lt]=' + _current.week + '&filter[order]=week ASC').then(
                        function(sucess) {
                            // console.log(sucess);
                            this.price = sucess.body;
                            sessionStorage.setItem('menu-price', JSON.stringify(this.price));
                            this.$forceUpdate();

                            this.form.order['price'][0] = this.price.sum;
                            this.form.order['price'][1] = this.price.breakfast;
                            this.form.order['price'][2] = this.price.lunch;
                            this.form.order['price'][3] = this.price.tea;
                        }, function(error) {}
                    )
                } else {
                    this.form.order['price'][0] = this.price.sum;
                    this.form.order['price'][1] = this.price.breakfast;
                    this.form.order['price'][2] = this.price.lunch;
                    this.form.order['price'][3] = this.price.tea;
                }

            }
            
            for (var i = 0; i < this.user.diners.length; i++) {
            	this.dinersSelected[i] = this.user.diners[i].id;
            }
        },
        created: function() {},
        methods: {
        	clearOrder: function(ele) {
        		var _order = document.getElementById('order'),
        		_head = _order.getElementsByClassName('pure-menu-heading'),
        		_index = this.dinersSelected.indexOf(ele);
        		if(_index != -1)
        			this.dinersSelected.splice(_index,1);
        		else 
        			this.dinersSelected.push(ele);
        		console.log(this.dinersSelected)

        		//

        		if(!_head[0].classList.contains('selected')) _head[0].click();
        		if(!_head[1].classList.contains('selected')) _head[1].click();
        		if(!_head[2].classList.contains('selected')) _head[2].click();
        		if(!_head[3].classList.contains('selected')) _head[3].click();
        		if(!_head[4].classList.contains('selected')) _head[4].click();
				//
        		_head[0].click();
        		_head[1].click();
        		_head[2].click();
        		_head[3].click();
        		_head[4].click();
        		//
        		this.form.order.sum  =  0;
        	},
            resum: function() {
                var _sum = 0;
                for (var day = 1; day < 6; day++) {
                    // console.log('order: ', this.form.order[day]);
                    for (var i = 0; i < this.form.order[day].length; i++) {
                        _sum += this.form.order[day][i] * this.form.order.price[i];
                    }
                }
                this.form.order.sum = _sum*this.dinersSelected.length;
                // console.log('prices: ', this.form.order.price);

            	//console.log('sum: ', this.form.order.sum)
                //console.log(' ------ ');
            },
            buy: function() {
            	console.log('order: ', this.form.order);
            	console.log('ds: ', this.dinersSelected);
            },
            order: function(day, meal, e) {
                // console.log('day: ', day);
                // console.log('meal: ', meal);
                // console.log('e: ', e);
                // console.log(' --- ');
                var remove = e.currentTarget.classList.contains('selected'),
                    disabled = e.currentTarget.classList.contains('disabled');
                if (!disabled) {

                    if (remove) {
                        e.currentTarget.classList.remove('selected');
                        this.form.order[day][meal]--;
                        if (meal == 0) {
                            var ul_li = e.currentTarget.nextElementSibling.children;
                            for (var i = 0; i < ul_li.length; ++i) {
                                var ele = ul_li[i].children[0];
                                ele.classList.remove('selected');

                            }
                        } else {
                            var parent = e.currentTarget.parentElement.parentElement.previousElementSibling;
                            if (parent.classList.contains('selected')) {

                                parent.classList.remove('selected');
                                this.form.order[day][0]--;
                                this.form.order[day][1]++;
                                this.form.order[day][2]++;
                                this.form.order[day][3]++;
                            }
                        }
                    } else {
                        e.currentTarget.classList.add('selected');
                        this.form.order[day][meal]++;
                        if (meal == 0) {
                            var ul_li = e.currentTarget.nextElementSibling.children;
                            for (var i = 0; i < ul_li.length; ++i) {
                                var ele = ul_li[i].children[0];
                                if (ele.classList.contains('selected')) {
                                    this.form.order[day][i + 1]--;
                                } else {
                                    ele.classList.add('selected');
                                }
                            }
                        }
                    }
                    this.resum();
                }
            },

            save: function(e) {
                // console.log("user p:", this.form.user.pass);
                // console.log("user e: ", this.form.user.email);
                // console.log("user: ", this.form.user.username);
                // console.log("diner:", this.form.diner.name);
                // console.log("address:", this.form.address);
                var error = false;

                this.form.error.diner.name = '';
                this.form.error.login = '';
                this.form.error.email = '';
                this.form.error.pass = '';
                if (this.form.user.password.length < 7) {
                    this.form.error.pass = 'error';
                    error = true;
                }
                if (this.form.user.email.indexOf('@') == -1 || this.form.user.email == 'test@test.pl') {
                    this.form.error.email = 'error';
                    error = true;
                }
                if (this.form.user.username.length < 2) {
                    this.form.error.login = 'error';
                    error = true;
                }
                if (this.form.diner.name.length < 2) {
                    this.form.error.diner.name = 'error';
                    error = true;
                }

                if (error) {
                    window.scrollTo(0, 0);
                } else {
                    this.$http.get('/api/users/count?where[email]=' + this.form.user.email).then(
                        function(sucess) {
                            if (sucess.body.count == 0) {
                                this.$http.get('/api/users/count?where[email]=' + this.form.user.email).then(
                                    function(sucess) {
                                        if (sucess.body.count == 0) {
                                            console.log(JSON.stringify(this.form.user))
                                            this.$http.post('/api/users/', JSON.stringify(this.form.user)).then(
                                                function(sucess) {
                                                    this.form.diner.userId = sucess.data.id;
                                                    this.$http.post('/api/diners', JSON.stringify(this.form.diner)).then(
                                                        function(sucess) {}, function(error) {}
                                                    );
                                                    this.form.address.userId = sucess.data.id;
                                                    this.$http.post('/api/addresses', JSON.stringify(this.form.address)).then(
                                                        function(sucess) {}, function(error) {}
                                                    );
                                                    console.log(sucess.data.id)
                                                    this.$http.post('/api/users/login', {
                                                        "username": this.form.user.username,
                                                        "password": this.form.user.password
                                                    }).then(
                                                        function(sucess) {
                                                            this.form.error = '';
                                                            this.user.id = sucess.data.userId;
                                                            this.user.accessToken = sucess.data.id;
                                                            console.log("user:", this.user)
                                                            location.href = './#/';
                                                            sessionStorage.setItem('user', JSON.stringify(this.user));

                                                        }, function(error) {
                                                            console.error("error:", error)
                                                            this.form.error = 'error';
                                                        }
                                                    );
                                                }, function(error) {}
                                            )
                                        } else {
                                            window.scrollTo(0, 0);
                                            this.form.error.login = 'error';
                                            error = true;
                                        }
                                    }, function(error) {}
                                )
                            } else {
                                window.scrollTo(0, 0);
                                this.form.error.email = 'error';
                                error = true;
                            }
                        }, function(error) {}
                    );
                }

            },
            changeAdress: function(e) {
                // console.log("user-data:", JSON.stringify(this.user.data))
                // console.log("user-adress:", JSON.stringify(this.user.address))

                this.$http.patch('/api/users/' + this.user.id + '?access_token=' + this.user.accessToken, JSON.stringify(this.user.data)).then(
                    function(sucess) {
                        this.form.formId = '';
                    }, function(error) {}
                );

                this.$http.patch('/api/addresses/' + this.user.address.id + '?access_token=' + this.user.accessToken, JSON.stringify(this.user.address)).then(
                    function(sucess) {
                        this.$http.get('/api/users/' + this.user.id + '/address').then(
                            function(sucess) {
                                // console.log(sucess);
                                this.user.address = sucess.body;
                                sessionStorage.setItem('user', JSON.stringify(this.user));
                                this.$forceUpdate();

                            }, function(error) {}
                        )

                    }, function(error) {}
                );
            },
            addDiner: function(e) {
                this.$http.post('/api/diners/', JSON.stringify(this.form.diner)).then(
                    function(sucess) {

                        this.$http.get('/api/users/' + this.user.id + '/diners').then(
                            function(sucess) {
                                // console.log(sucess);
                                this.user.diners = sucess.body;
                                sessionStorage.setItem('user', JSON.stringify(this.user));
                                this.form.formId = '';
                                this.$forceUpdate();
                            }, function(error) {}
                        )

                    }, function(error) {}
                );

            },
            editDiner: function(e) {
                var _id = this.form.formId;
                var editedDiner = this.user.diners.filter(function(diner) {
                    if (diner.id == _id) return diner;
                });

                this.$http.put('/api/diners/' + _id, JSON.stringify(editedDiner[0])).then(
                    function(sucess) {
                        this.form.formId = '';
                    }, function(error) {}
                );
            },
            deleteDiner: function(e) {
                var _id = this.form.formId;

                this.$http.delete('/api/diners/' + _id).then(
                    function(sucess) {

                        this.$http.get('/api/users/' + this.user.id + '/diners').then(
                            function(sucess) {
                                // console.log(sucess);
                                this.user.diners = sucess.body;
                                sessionStorage.setItem('user', JSON.stringify(this.user));
                                this.form.formId = '';
                                this.$forceUpdate();
                            }, function(error) {}
                        )

                    }, function(error) {}
                );
                // var editedDiner = this.user.diners.filter(function(diner){ if(diner.id == _id) return diner; });

                // this.$http.put('/api/diners/'+_id, JSON.stringify(editedDiner[0])).then(
                //     function(sucess) { this.form.formId = ''; },function(error) {}
                // );                
            },
            dinerAdd: function() {
                this.form.formId = this.form.formId == '' ? 'new' : '';
            },
            dinerEdit: function(dinerId) {
                this.form.formId = this.form.formId == '' ? dinerId : '';
            },
            addressEdit: function(addressId) {
                this.form.formId = this.form.formId == '' ? addressId : '';
            },
            cashIn: function() {
                alert('w nowym oknie masz przejście do płatności')
            },
            login: function() {
                if (this.form.login != '') {
                    console.log(this.form.login)
                    if (this.form.login.user.indexOf('@') == -1) {
                        this.$http.post('/api/users/login', {
                            "username": this.form.login.user,
                            "password": this.form.login.pass
                        }).then(
                            function(sucess) {
                                this.form.error = '';
                                this.user.id = sucess.data.userId;
                                this.user.accessToken = sucess.data.id;
                                console.log("user:", this.user)
                                location.href = './#/';
                                sessionStorage.setItem('user', JSON.stringify(this.user));

                            }, function(error) {
                                console.error("error:", error)
                                this.form.error = 'error';
                            }
                        );
                    } else {
                        this.$http.post('/api/users/login', {
                            "email": this.form.login.user,
                            "password": this.form.login.pass
                        }).then(
                            function(sucess) {
                                this.form.error = '';
                                this.user.id = sucess.data.userId;
                                this.user.accessToken = sucess.data.id;
                                console.log("user:", this.user)
                                location.href = './#/';
                                sessionStorage.setItem('user', JSON.stringify(this.user));

                            }, function(error) {
                                console.error("error:", error)
                                this.form.error = 'error';
                            }
                        );
                    }
                }

            }
        }
    });

})(Vue, window, document);
