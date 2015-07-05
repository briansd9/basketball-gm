define(["lib/react", "util/helpers"], function (React, helpers) {
    "use strict";

    return {
        getInitialState: function () {
            return {
                clicked: false
            };
        },

        toggleClickableRow: function () {
            this.setState({
                clicked: !this.state.clicked
            });
        }
    };
});