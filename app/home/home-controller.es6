(function () {
  'use strict';

  class HomeCtrl {
    constructor($scope, Pubnub, $log, $pubnubChannel, $interval) {
      'ngInject';
      const vm = this;
      vm.$scope = $scope;
      vm.$log = $log;
      vm.$pubnubChannel = $pubnubChannel;
      vm.$interval = $interval;
      vm.thePosition = 'Something';
      vm.lat = 1;
      vm.long = 1;
      vm.movementDone = 0;
      vm.isFirst = true;
      vm.isMap = false;
      vm.activateMap = false;
      vm.goToMap = () => {
        vm.isFirst = false;
        vm.isMap = true;
        require([
            "esri/Map",
            "esri/views/SceneView",

            "esri/layers/SceneLayer",
            "esri/layers/GraphicsLayer",

            "esri/Graphic",
            "esri/geometry/Point",
            "esri/geometry/Polyline",
            "esri/geometry/Polygon",

            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",

            "esri/renderers/SimpleRenderer",
            "esri/symbols/MeshSymbol3D",
            "esri/symbols/FillSymbol3DLayer",
            "esri/symbols/PictureMarkerSymbol",

            "dojo/domReady!"
        ], (Map, SceneView, SceneLayer, GraphicsLayer,
            Graphic, Point, Polyline, Polygon,
            SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
            SimpleRenderer, MeshSymbol3D, FillSymbol3DLayer, PictureMarkerSymbol) => {
            // Create default MeshSymbol3D for symbolizing SceneLayer
            // a new FillSymbol3DLayer is created by default within the symbol
            var symbol = new MeshSymbol3D({
                symbolLayers: [
                    new FillSymbol3DLayer({
                        material: {
                            color: [120, 200, 120, 0.95]
                        }
                    })
                ]
            });

            // Create the renderer and configure visual variables
            var renderer = new SimpleRenderer({
                symbol: symbol
            });

            var map = new Map({
                basemap: "streets",
                ground: "world-elevation",
                // layers: [sceneLayer]
            });

            var londonExtent = { // autocasts as new Extent()
                xmin: -1,
                xmax: 0.75,
                ymin: 51.25,
                ymax: 51.75
            };

            var view = new SceneView({
                container: "viewDiv",
                map: map,
                clippingArea: londonExtent,
                scale: 30000,
                center: [-0.019958, 51.544555]
            });

            view.ui.empty('top-left');
            var graphicsLayer = new GraphicsLayer();
            map.add(graphicsLayer);

            var sceneLayer = new SceneLayer({
                // visible: false,
                renderer: renderer,
                url: "http://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/OS_Open_3D_Building_Heights/SceneServer/"
            });

            map.add(sceneLayer);

            view.on('click', function() {
                graphicsLayer.removeAll();
                var long = -0.019958; //from backend
                var lat = 51.544555; //from backend
                var sc = 1500;
                var sz = sc / 40;
                var cl1 = [255, 200, 100];
                var cl2 = [0, 0, 0];

                var point = new Point({
                        longitude: long,
                        latitude: lat,
                        z: sz
                    }),
                    markerSymbol = new SimpleMarkerSymbol({
                        color: cl1,
                        outline: { // autocasts as new SimpleLineSymbol()
                            color: cl2,
                            width: 2
                        }
                    });

                var pic = new PictureMarkerSymbol({
                    url: "https://webapps-cdn.esri.com/Apps/MegaMenu/img/logo.jpg",
                    width: 8,
                    height: 8
                });

                var pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });

                graphicsLayer.add(pointGraphic);

                var polyline = new Polyline([
                        [long, lat, 0],
                        [long, lat, sz]
                    ]),
                    lineSymbol = new SimpleLineSymbol({
                        color: cl1,
                        width: 4
                    });

                var polylineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: lineSymbol
                });

                graphicsLayer.add(polylineGraphic);

                view.goTo({
                    target: [long, lat],
                    tilt: 60,
                    scale: sc
                });
                vm.activateMap = true;
                vm.moveTo = (lat, long) => {
                  graphicsLayer.removeAll();
                  var sc = 1500;
                  var sz = sc / 40;
                  var cl1 = [255, 200, 100];
                  var cl2 = [0, 0, 0];

                  var point = new Point({
                          longitude: long,
                          latitude: lat,
                          z: sz
                      }),
                      markerSymbol = new SimpleMarkerSymbol({
                          color: cl1,
                          outline: { // autocasts as new SimpleLineSymbol()
                              color: cl2,
                              width: 2
                          }
                      });

                  var pic = new PictureMarkerSymbol({
                      url: "https://webapps-cdn.esri.com/Apps/MegaMenu/img/logo.jpg",
                      width: 8,
                      height: 8
                  });

                  var pointGraphic = new Graphic({
                      geometry: point,
                      symbol: markerSymbol
                  });

                  graphicsLayer.add(pointGraphic);

                  var polyline = new Polyline([
                          [long, lat, 0],
                          [long, lat, sz]
                      ]),
                      lineSymbol = new SimpleLineSymbol({
                          color: cl1,
                          width: 4
                      });

                  var polylineGraphic = new Graphic({
                      geometry: polyline,
                      symbol: lineSymbol
                  });

                  graphicsLayer.add(polylineGraphic);

                  view.goTo({
                      target: [long, lat],
                      tilt: 60,
                      scale: sc
                  });
                };
                // Create SceneLayer and add to the map


                // view.on('click', function() {
                //     view.goTo({
                //         tilt: 0,
                //         scale: 30000,
                //         center: [-0.12, 51.50]
                //     });
                //     view.on('click', function() {
                //         view.goTo({
                //             target: [long, lat],
                //             tilt: 40,
                //             scale: sc
                //         });
                //     });
                // });
            });
        });
      };
      vm.Pubnub = Pubnub;
      vm.Pubnub.init({
        publishKey: 'pub-c-bd389cd2-4ed5-46b8-884e-6cb24623872d',
        subscribeKey: 'sub-c-385e20e6-b9ac-11e6-9868-02ee2ddab7fe'
      });
      vm.$scope.channel = $pubnubChannel('location');
      vm.$interval(() => {
        vm.Pubnub.publish({
          message: {
            request: 'whereAreYou'
          },
          channel: 'locationrequest'
        }, (status, response) => {
          if (status.error) {
            vm.$log.log(status);
          } else {
            vm.$log.log('message Published w/ timetoken', response.timetoken);
          }
        });
      }, 500);
      vm.Pubnub.addListener({
        message: message => {
          if (vm.activateMap) {
            vm.moveTo(message.message.lat, message.message.long);
            vm.movementDone = vm.movementDone + 1;
          }
        }
      });
      vm.listOfNames = [
        'Darlene Corney',
        'Karole Knick',
        'Treasa Struthers',
        'Anisha Folsom',
        'Vida Rotter',
        'Chante Templin',
        'Mike Redwine',
        'Mamie Tull',
        'Kyla Stamey',
        'Dodie Greaver',
        'Gisela Benzing',
        'Sunday Wetzler',
        'Wan Brune',
        'Arica Steiner',
        'Joy Feliciano',
        'Valorie Countess',
        'Hulda Serrano',
        'Colby Nickens',
        'Carlena Ferrante',
        'Fredia Plaster',
        'Charlette Mangels',
        'Carman Brouillette',
        'Halina Rochester',
        'Cyrus Back',
        'Julienne Caulkins',
        'Adeline Griffis',
        'Racquel Duron',
        'Eveline Salgado',
        'Veronique Casady',
        'Kayce Villano',
        'Vena Winchell',
        'Ken Woodson',
        'Erwin Benedict',
        'Tom Shea',
        'Roberta Kersey',
        'Ettie Schilling',
        'Crystle Ryland',
        'Tarra Decarlo',
        'Madge Heyer',
        'Delaine Riding',
        'Jere Basilio',
        'Johnna Rast',
        'Chelsea Coplin',
        'Antoine Veith',
        'Antony Arbaugh',
        'Tawanda Olds',
        'Shaunte Cull',
        'Lottie Ellerman',
        'Xuan Roca',
        'Nereida Teixeira',
        'Kelley Stampley',
        'Kiersten Giddens',
        'Jacquelynn Leask',
        'Mariam Fountain',
        'Leatha Troung',
        'Denice Coady',
        'Ernie Goodlett',
        'Donya Crosland',
        'Rita Hembree',
        'Reatha Lombardo',
        'Ashlyn Mathieson',
        'Danyell Erhart',
        'Leandro Budd',
        'Zona Rosenblum',
        'Marty Arriola',
        'Mae Surita',
        'Carletta Massa',
        'Nia Fitts',
        'Merle Downes',
        'Earline Teneyck',
        'Eugene Hsu',
        'Tiana Bunce',
        'Una Weekly',
        'Lizbeth Calabria',
        'Mindy Larocco',
        'Dian Dimatteo',
        'Lynda Grout',
        'Pearle Pullman',
        'Iliana Kilbane',
        'Paulene Maugeri',
        'Gregoria Reay',
        'Elissa Wager',
        'Melodie Shuck',
        'Horace Marcucci',
        'Guy Mcmann',
        'Coretta Galicia',
        'Denyse Shield',
        'Barrie Land',
        'Lyle Winkel',
        'Jama Musselman',
        'Brendon Irwin',
        'Oretha Deltoro',
        'Nilsa Bring',
        'Aleshia Hossain',
        'Billi Zeno',
        'Orval Greenawalt',
        'Tonda Dutra',
        'Peter Adkison',
        'Vernon Klink',
        'Carol Pavia',
        'Rhett Daughtrey'
      ];
      vm.getNames = subStringOfName => {
        const namesToReturn = [];
        vm.listOfNames.forEach(n => {
          if (n.toLowerCase().includes(subStringOfName.toLowerCase())) {
            namesToReturn.push(n);
          }
        });

        return namesToReturn;
      };
      vm.Pubnub.subscribe({
        channels: ['location']
      });
    }
  }

  /**
   * @ngdoc object
   * @name home.controller:HomeCtrl
   *
   * @description
   *
   */
  angular
    .module('home')
    .controller('HomeCtrl', HomeCtrl);
}());
