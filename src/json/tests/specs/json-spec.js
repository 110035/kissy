KISSY.use("json", function (S, Json) {

    var J = ((S.UA.nodejs && typeof global === 'object') ? global : S.Env.host).Json;

    describe('json', function () {
        describe('stringify', function () {
            it('should convert an arbitrary value to a Json string representation', function () {
                expect(Json.stringify({'a': true})).toBe('{"a":true}');

                expect(Json.stringify(true)).toBe('true');

                expect(Json.stringify(null)).toBe('null');
                expect(Json.stringify(undefined)).toBe(undefined);
                expect(Json.stringify(NaN)).toBe('null');


                if (J) {
                    expect(Json.stringify({'a': true})).toBe(J.stringify({'a': true}));

                    expect(Json.stringify(true)).toBe(J.stringify(true));

                    expect(Json.stringify(null)).toBe(J.stringify(null));
                    expect(Json.stringify(undefined)).toBe(J.stringify(undefined));
                    expect(Json.stringify(NaN)).toBe(J.stringify(NaN));
                }
            });

            describe('indent', function () {
                it('string works for object', function () {

                    var gap = ' ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, gap);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (J) {
                        expect(ret).toBe(J.stringify({
                            'a': {
                                b: 1
                            }
                        }, null, gap));
                    }
                });


                it('string works for array', function () {

                    var gap = ' ';
                    var space = ' ';

                    var ret = Json.stringify({
                        'a': [1]
                    }, null, gap);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    if (J) {
                        expect(ret).toBe(J.stringify({
                            'a': [1]
                        }, null, gap));
                    }
                });


                it('number works for object', function () {

                    var gap = '  ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: 1
                        }
                    }, null, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (J) {
                        expect(ret).toBe(J.stringify({
                            'a': {
                                b: 1
                            }
                        }, null, 2));
                    }
                });


                it('string works for array', function () {

                    var gap = '  ';
                    var space = ' ';

                    var ret = Json.stringify({
                        'a': [1]
                    }, null, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    if (J) {
                        expect(ret).toBe(J.stringify({
                            'a': [1]
                        }, null, 2));
                    }
                });
            });


            describe('replacer', function () {
                it('works for object', function () {
                    var gap = '  ';
                    var space = ' ';
                    var ret = Json.stringify({
                        'a': {
                            b: {
                                z: 1
                            }
                        }
                    }, function (key, value) {
                        if (key == 'b') {
                            expect(value.z).toBe(1);
                            return 1;
                        }
                        return value;
                    }, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '{\n' +
                        gap + gap + '"b":' + space + '1\n' +
                        gap + '}' +
                        '\n}');

                    if (J) {
                        expect(ret).toBe(J.stringify({
                            'a': {
                                b: {
                                    z: 1
                                }
                            }
                        }, function (key, value) {
                            if (key == 'b') {
                                expect(value.z).toBe(1);
                                return 1;
                            }
                            return value;
                        }, 2));
                    }
                });


                it('string works for array', function () {

                    var gap = '  ';
                    var space = ' ';

                    var ret = Json.stringify({
                        'a': [
                            {
                                z: 1
                            }
                        ]
                    }, function (key, value) {
                        if (key === '0') {
                            expect(value.z).toBe(1);
                            return 1;
                        }
                        return value;
                    }, 2);

                    expect(ret).toBe('{\n' +
                        gap +
                        '"a":' + space + '[\n' +
                        gap + gap + '1\n' +
                        gap + ']' +
                        '\n}');

                    if (J && !S.UA.phantomjs) {
                        expect(ret).toBe(J.stringify({
                            'a': [
                                {
                                    z: 1
                                }
                            ]
                        }, function (key, value) {
                            if (key === '0') {
                                expect(value.z).toBe(1);
                                return 1;
                            }
                            return value;
                        }, 2));
                    }
                });
            });
        });

        describe('parse', function () {

            it('allow whitespace', function () {
                var t = '{"test": 1,"t":2}',
                    r = {test: 1, t: 2};
                expect(Json.parse(t)).toEqual(r);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
            });

            it('works for array', function () {
                var t = "{\"test\":[\"t1\",\"t2\"]}" ,
                    r = {test: ['t1', 't2']};
                expect(Json.parse(t)).toEqual(r);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
            });

            it('should throw exception when encounter non-whitespace', function () {
                var t = '{"x": x"2"}';
                expect(function () {
                    Json.parse(t);
                }).toThrow();
                if (J) {
                    expect(function () {
                        J.parse(t);
                    }).toThrow();
                }
            });

            it('should parse a Json string to the native JavaScript representation', function () {

                var r, t;
                expect(Json.parse(t = '{"test":1}')).toEqual(r = {test: 1});
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = '{}')).toEqual(r = {});
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = '\n{"test":1}')).toEqual(r = {test: 1}); // 去除空白
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = null)).toBeNull(r = null);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = 'true')).toBe(r = true);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = true)).toBe(r = true);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(Json.parse(t = 'null')).toBe(r = null);
                if (J) {
                    expect(J.parse(t)).toEqual(r);
                }
                expect(
                    function () {
                        Json.parse(t = '{a:1}');
                    }).toThrow();
                if (J) {
                    expect(
                        function () {
                            Json.parse(t);
                        }).toThrow();
                }

            });

            it('reviver works', function () {
                var t, f, r;
                expect(Json.parse(t = '{"test": 1,"t":2}', f = function (key, v) {
                    if (key == 't') {
                        return v + 1;
                    }
                    return v;
                })).toEqual(r = {test: 1, t: 3});
                if (J) {
                    expect(J.parse(t, f)).toEqual(r);
                }

                expect(Json.parse(t = '{"test": 1,"t":2}', f = function (key, v) {
                    if (key == 't') {
                        return undefined;
                    }
                    return v;
                })).toEqual(r = {test: 1});
                if (J) {
                    expect(J.parse(t, f)).toEqual(r);
                }

                expect(Json.parse(t = '{"test": {"t":{ "t3":4},"t2":4}}', f = function (key, v) {
                    if (key == 't') {
                        return 1;
                    }
                    if (key == 't2') {
                        return v + 1;
                    }
                    return v;
                })).toEqual(r = {test: {
                        t: 1,
                        t2: 5
                    }});
                if (J) {
                    expect(J.parse(t, f)).toEqual(r);
                }
            });


            // phantomjs allow \t
            it('should throw exception when encounter control character', function () {
                var r;
                expect(function () {
                    Json.parse(t = '{"x":"\t"}');
                }).toThrow();
                if (J) {
                    expect(
                        function () {
                            Json.parse(t);
                        }).toThrow();
                }
            });

        });
    });

});
