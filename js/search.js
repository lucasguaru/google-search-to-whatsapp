'use strict';

var client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: 'xdxgx6aqyeta',
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: 'c7913fc93e895abc0819325af086c57b6edf003f00dc6a164ca649fca6d3a7f2'
});

var app = angular.module('demo', ['ngSanitize', 'ui.select']);

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
app.filter('propsFilter', function () {
  return function (items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function (item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          var textSplit = text.split(" ");
          if (textSplit.length > 1) {
            var itemSplitMatchesCount = 0;
            for (var j = 0; j < textSplit.length; j++) {
              if (item[prop].toString().toLowerCase().indexOf(textSplit[j]) !== -1) {
                itemSplitMatchesCount++;
              }
            }
            if (itemSplitMatchesCount == textSplit.length) {
              itemMatches = true;
              break;
            }
          } else {
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

var janelaWhats = undefined;

app.controller('UrlCtrl', function ($scope, $http, $timeout, $interval) {
  var vm = this;

  $scope.atualizar = function() {
    client.getEntries({
      content_type: "contatoWhatsapp"
    }).then(function (response) {
      console.log(response);
      var contatos = [];
      response.items.forEach(contato => contatos.push(contato.fields));
      contatos.forEach(contato => contato.nomeCompleto = contato.nome + " - " + contato.nomeDoAnimal);
      vm.contatos = contatos;
      localStorage.setItem("contatos", JSON.stringify(contatos));
      $scope.$apply();
    });
  }

  var contatos = localStorage.getItem("contatos");
  if (!contatos) {
    $scope.atualizar();
  } else {
    vm.contatos = JSON.parse(contatos);
  }

  vm.setInputFocus = function () {
    $scope.$broadcast('UiSelectDemo1');
  };
  

  $scope.onSelectCallback = function () {
    var contato = $scope.ctrl.contato.selected;
    var tel = contato.telefone.replace(/\D/g, '');
    if (tel.length == 9) {
      tel = '11' + tel;
    } else if (tel.length != 11) {
      alert('O número de telefone parece estar incorreto e a mensagem não será enviada. Telefone: ' + tel);
      return;
    }
    tel = '55' + tel;
    var artigo = 'o';
    if (contato.sexoDoCachorro == 'F') {
      artigo = 'a';
    }
    var texto = 'Olá ' + contato.nome.split(' ')[0] + ', ' + artigo + ' ' + contato.nomeDoAnimal + ' está pront' + artigo + '. Já pode vir buscar! Obrigado. Cris Vet';
    var url = 'https://api.whatsapp.com/send?phone=' + tel + '&text=' + texto;
    window.open(url, '_blank');
    
  };

  vm.links = links;

});
