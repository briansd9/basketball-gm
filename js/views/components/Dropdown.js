define(["lib/davis", "lib/react", "util/helpers"], function (Davis, React, helpers) {
    "use strict";

    return React.createClass({
        handleChange: function (i, event) {
            var args, leaguePage, url;

            console.log(event);
            console.log(event.target.value);

            // Name of the page (like "standings"), with # and ? stuff removed
            leaguePage = document.URL.split("/", 6)[5].split("#")[0].split("?")[0];

            args = [leaguePage];
            this.props.values.forEach(function (value, j) {
                if (i === j) {
                    args.push(event.target.value);
                } else {
                    args.push(value);
                }
            });

            url = helpers.leagueUrl(args);

// Somehow want to update URL without triggering re-render
            Davis.location.assign(new Davis.Request(url));

            this.props.onChange(i, event.target.value);
        },

        render: function () {
            var options;

            options = this.props.fields.map(function (field) {
                if (field === "seasons") {
                    return helpers.getSeasons().map(function (s) {
                        return <option key={s.season} value={s.season}>{s.season} Season</option>;
                    });
                }
            });

            return (
                <form className="form-inline pull-right bbgm-dropdown">
                    {this.props.fields.map(function (field, i) {
                        var value;

                        value = this.props.values[i];

                        return (
                            <div key={field} className="form-group" style={{marginLeft: "4px", marginBottom: "4px"}}>
                                <select onChange={this.handleChange.bind(this, i)} className="form-control" value={value}>
                                    {options[i]}
                                </select>
                            </div>
                        );
                    }.bind(this))}
                </form>
            );
        }
    });
});