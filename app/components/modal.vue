<template>
  <div class="modal fade" tabindex="-1" role="dialog" :id="elementId">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 class="modal-title">{{title}}</h4>
              </div>
              <div class="modal-body">
                  <slot></slot>
              </div>
              <div class="modal-footer" v-if="showActions">
                  <button type="button" class="btn btn-default" data-dismiss="modal" @click="close">{{$t("message.close")}}</button>
                  <button type="button" class="btn btn-primary" @click="save">{{$t("message.save")}}</button>
              </div>
          </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
</template>

<script>

import _ from 'lodash';

let component = {

  props: {
    onClose: Function,
    onSave: Function,
    title: {
      type: String,
      default: ''
    },
    elementId: {
      type: String,
      default: ''
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    
    close(event) {
      if(_.isFunction( this.onClose )){
        return this.onClose.apply(this, [event]);
      }
    },//eo close

    save(event) {
      if(_.isFunction( this.onSave )){
        return this.onSave.apply(this, [event]);
      }
    },//eo save

  },//eo methods

  data() {

    return {
      
    };

  }//eo data

};

export default component;
</script>

<style></style>