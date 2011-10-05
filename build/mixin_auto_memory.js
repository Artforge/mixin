/*
  mixin_auto_memory.js
  (c) 2011 Kevin Malakoff.
  Mixin.AutoMemory is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core, Underscore.js, Underscore-Awesomer.js
*/if (!Mixin && (typeof exports !== 'undefined')) {
  this.Mixin = require('mixin_core').Mixin;
}
if (!Mixin) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Mixin is missing. Please ensure it is included");
}
if (!_.VERSION) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Underscore.js must be included before this file");
}
if (!_.AWESOMENESS) {
  throw new Error("Mixin.AutoMemory: Dependency alert! Underscore-Awesomer.js must be included before this file");
}
Mixin.AutoMemory || (Mixin.AutoMemory = {});
Mixin.AutoMemory.root = this;
Mixin.AutoMemory.WRAPPER = Mixin.AutoMemory.root['$'] ? $ : '$';
Mixin.AutoMemory.Property = (function() {
  function Property(owner) {
    this.owner = owner;
  }
  Property.prototype.setArgs = function() {
    var key_or_array, _i, _len, _ref, _results;
    if (!arguments.length) {
      throw new Error("Mixin.AutoMemory: missing key");
    }
    this.args = Array.prototype.slice.call(arguments);
    if (!Mixin.DEBUG) {
      return this;
    }
    if (_.isArray(this.args[0])) {
      _ref = this.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key_or_array = _ref[_i];
        _results.push(this._validateEntry(key_or_array));
      }
      return _results;
    } else {
      return this._validateEntry(this.args);
    }
  };
  Property.prototype.destroy = function() {
    var key_or_array, _i, _len, _ref, _results;
    if (_.isArray(this.args[0])) {
      _ref = this.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key_or_array = _ref[_i];
        _results.push(this._destroyEntry(key_or_array));
      }
      return _results;
    } else {
      return this._destroyEntry(this.args);
    }
  };
  Property.prototype._validateEntry = function(entry) {
    var fn_ref, key;
    key = entry[0];
    fn_ref = entry.length > 1 ? entry[1] : void 0;
    if (!_.keypathExists(this.owner, key)) {
      throw new Error("Mixin.AutoMemory: property '" + key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
    }
    if (fn_ref && !(_.isFunction(fn_ref) || _.isString(fn_ref))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference for property '" + key + "' on '" + (_.classOf(this.owner)) + "'");
    }
  };
  Property.prototype._destroyEntry = function(entry) {
    var fn_ref, key, property, value, _i, _len, _ref;
    key = entry[0];
    fn_ref = entry.length > 1 ? entry[1] : void 0;
    if (!fn_ref) {
      _.keypath(this.owner, key, null);
      return;
    }
    value = _.keypath(this.owner, key);
    if (!value) {
      return;
    }
    if (_.isFunction(fn_ref)) {
      fn_ref.apply(this.owner, [value].concat(entry.length > 2 ? entry.slice(2) : []));
    } else {
      if (_.isFunction(value[fn_ref])) {
        value[fn_ref].apply(value, entry.length > 2 ? entry.slice(2) : []);
      } else {
        _ref = entry.slice(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          property = _ref[_i];
          this._destroyEntry([property]);
        }
      }
    }
    return _.keypath(this.owner, key, null);
  };
  return Property;
})();
Mixin.AutoMemory.WrappedProperty = (function() {
  function WrappedProperty(owner, key, fn_ref, wrapper) {
    var _i, _len, _ref;
    this.owner = owner;
    this.key = key;
    this.fn_ref = fn_ref;
    this.wrapper = wrapper;
    if (this.fn_ref && _.isArray(this.fn_ref)) {
      if (Mixin.DEBUG && !this.fn_ref.length) {
        throw new Error("Mixin.AutoMemory: unexpected function reference");
      }
      this.args = this.fn_ref.splice(1);
      this.fn_ref = this.fn_ref[0];
    }
    if (!Mixin.DEBUG) {
      return this;
    }
    if (!this.key) {
      throw new Error("Mixin.AutoMemory: missing key");
    }
    if (_.isArray(this.key)) {
      _ref = this.key;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (!_.keypathExists(this.owner, key)) {
          throw new Error("Mixin.AutoMemory: property '" + key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
        }
      }
    } else {
      if (!_.keypathExists(this.owner, this.key)) {
        throw new Error("Mixin.AutoMemory: property '" + this.key + "' doesn't exist on '" + (_.classOf(this.owner)) + "'");
      }
    }
    if (this.fn_ref && !(_.isFunction(this.fn_ref) || _.isString(this.fn_ref))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference");
    }
    if (!this.wrapper) {
      throw new Error("Mixin.AutoMemory: missing wrapper");
    }
  }
  WrappedProperty.prototype.destroy = function() {
    var key, _i, _len, _ref, _results;
    if (_.isArray(this.key)) {
      _ref = this.key;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(this._destroyKey(key));
      }
      return _results;
    } else {
      return this._destroyKey(this.key);
    }
  };
  WrappedProperty.prototype._destroyKey = function(key) {
    var value, wrapped_value, wrapper;
    if (!this.fn_ref) {
      _.keypath(this.owner, key, null);
      return;
    }
    value = _.keypath(this.owner, key);
    if (!value) {
      return;
    }
    wrapper = _.isString(this.wrapper) ? Mixin.AutoMemory.root[this.wrapper] : this.wrapper;
    wrapped_value = wrapper(value);
    if (_.isFunction(this.fn_ref)) {
      this.fn_ref.apply(this.owner, [wrapped_value].concat(this.args ? this.args.slice() : []));
    } else {
      if (Mixin.DEBUG && !_.isFunction(wrapped_value[this.fn_ref])) {
        throw new Error("Mixin.AutoMemory: function '" + this.fn_ref + "' missing for wrapped property '" + key + "' on '" + (_.classOf(this.owner)) + "'");
      }
      wrapped_value[this.fn_ref].apply(wrapped_value, this.args);
    }
    return _.keypath(this.owner, key, null);
  };
  return WrappedProperty;
})();
Mixin.AutoMemory.Function = (function() {
  function Function(object, fn_ref, args) {
    this.object = object;
    this.fn_ref = fn_ref;
    this.args = args;
    if (!Mixin.DEBUG) {
      return this;
    }
    if (!this.fn_ref) {
      throw new Error("Mixin.AutoMemory: missing fn_ref");
    }
    if (!_.isFunction(this.fn_ref) && !(this.object && _.isString(this.fn_ref) && _.isFunction(this.object[this.fn_ref]))) {
      throw new Error("Mixin.AutoMemory: unexpected function reference");
    }
  }
  Function.prototype.destroy = function() {
    if (!this.object) {
      this.fn_ref.apply(null, this.args);
      return;
    }
    if (!_.isFunction(this.fn_ref)) {
      this.object[this.fn_ref].apply(this.object, this.args);
      return;
    }
    return this.fn_ref.apply(this.object, [this.object].concat(this.args ? this.args.slice() : []));
  };
  return Function;
})();
Mixin.AutoMemory._mixin_info = {
  mixin_name: 'AutoMemory',
  initialize: function() {
    return Mixin.instanceData(this, 'AutoMemory', []);
  },
  destroy: function() {
    var callback, callbacks, _i, _len, _results;
    callbacks = Mixin.instanceData(this, 'AutoMemory');
    Mixin.instanceData(this, 'AutoMemory', []);
    _results = [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      callback = callbacks[_i];
      _results.push(callback.destroy());
    }
    return _results;
  },
  mixin_object: {
    autoProperty: function(key, fn_ref) {
      var auto_property;
      auto_property = new Mixin.AutoMemory.Property(this);
      auto_property.setArgs.apply(auto_property, arguments);
      Mixin.instanceData(this, 'AutoMemory').push(auto_property);
      return this;
    },
    autoWrappedProperty: function(key, fn_ref, wrapper) {
      if (wrapper === void 0) {
        wrapper = Mixin.AutoMemory.WRAPPER;
      }
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.WrappedProperty(this, key, fn_ref, wrapper));
      return this;
    },
    autoFunction: function(object, fn_ref) {
      Mixin.instanceData(this, 'AutoMemory').push(new Mixin.AutoMemory.Function(object, fn_ref, Array.prototype.slice.call(arguments, 2)));
      return this;
    }
  }
};
Mixin.registerMixin(Mixin.AutoMemory._mixin_info);