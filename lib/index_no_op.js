const KeenCore = {};

KeenCore.ready = function ready() {
  window.p2_no_op_mode_enabled = true;
};

export const Keen = KeenCore;
export const KeenTracking = Keen;
export default Keen;
