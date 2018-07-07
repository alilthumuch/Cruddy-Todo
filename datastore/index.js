const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  //var id = counter.getNextUniqueId(callback);
  counter.getNextUniqueId(function(err, countNumber) {
    if(err) {
      throw err;
    } else {
      // items[id] = text;
      fs.writeFile(path.join(exports.dataDir, `${countNumber}.txt`), text, function(err){
        if(err){
          throw err;
        } else{
          callback(null, {id: countNumber, text: text});
        }
      });
      
    }
  })
  
};

exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      callback (new Error('no item with this id'));
    } else {
      callback(null, {id: id, text: fileData.toString()});
    }
  })
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, {id: id, text: item});
  // }
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      var dataArr = _.map(files, (file) => {
        var id = path.basename(file, '.txt');
        var filepath = path.join(exports.dataDir, file);
        return readFilePromise(filepath).then(fileData => {
          return {
            id: id,
            text: fileData.toString()
          };
        });
      });
      Promise.all(dataArr)
      .then(items => callback(null, items), err => callback(err));
    };
  });
  // var data = [];
  // _.each(items, (item, idx) => {
  //   data.push({ id: idx, text: items[idx] });
  // });
  // callback(null, data);
};

exports.update = (id, text, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`)
  fs.readFile(filePath, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          callback(new Error('no item with id'));
        } else {
          callback(null, {id:id, text: text});
        };
      });
    };
  })
  
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, {id: id, text: text});
  // }
};

exports.delete = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`)
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error('no item with id'))
    } else {
      callback();
    };
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
