define(["lib/react", "util/helpers"], function (React, helpers) {
    "use strict";

    return React.createClass({
        render: function () {
            return (
                <a href={helpers.leagueUrl(this.props.parts)}>{this.props.children}</a>
            );
        }
    });
});