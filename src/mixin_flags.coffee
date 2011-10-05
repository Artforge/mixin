###
  mixin_flags.js
  (c) 2011 Kevin Malakoff.
  Mixin.Flags is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/mixin/blob/master/LICENSE
  Dependencies: Mixin.Core
###

this.Mixin = require('mixin_core').Mixin if not Mixin and (typeof(exports) != 'undefined')
throw new Error("Mixin.Flags: Dependency alert! Mixin is missing. Please ensure it is included") if not Mixin
Mixin.Flags||Mixin.Flags={}

Mixin.Flags._mixin_info =
  mixin_name: 'Flags'

  initialize: (flags=0, change_callback) ->
    Mixin.instanceData(this, 'Flags', {flags: flags, change_callback: change_callback})

  mixin_object: {
    flags: (flags) ->
      instance_data = Mixin.instanceData(this, 'Flags')
      # set
      if (flags != undefined)
        previous_flags = instance_data.flags
        instance_data.flags = flags
        instance_data.change_callback(instance_data.flags) if (instance_data.change_callback && (previous_flags!=instance_data.flags))
      # get or set
      return instance_data.flags

    hasFlags: (flags) ->
      instance_data = Mixin.instanceData(this, 'Flags')
      return !!(instance_data.flags&flags)

    setFlags: (flags) ->
      instance_data = Mixin.instanceData(this, 'Flags')
      previous_flags = instance_data.flags
      instance_data.flags |= flags
      instance_data.change_callback(instance_data.flags) if (instance_data.change_callback && (previous_flags!=instance_data.flags))
      return instance_data.flags

    resetFlags: (flags) ->
      instance_data = Mixin.instanceData(this, 'Flags')
      previous_flags = instance_data.flags
      instance_data.flags &= ~flags
      instance_data.change_callback(instance_data.flags) if (instance_data.change_callback && (previous_flags!=instance_data.flags))
      return instance_data.flags
  }

####################################################
# Make mixin available
####################################################
Mixin.registerMixin(Mixin.Flags._mixin_info)