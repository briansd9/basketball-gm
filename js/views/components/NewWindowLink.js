define(["lib/react", "util/helpers"], function (React, helpers) {
    "use strict";

    return React.createClass({
        render: function () {
            var newWindowJs, url;
            if (!this.props.parts) {
                url = document.URL;
            } else {
                url = helpers.leagueUrl(this.props.parts);
            }

            // Window name is set to the current time, so each window has a unique name and thus a new window is always opened
            newWindowJs = "javascript:(function () { window.open('" + url + "?w=popup', Date.now(), 'height=600,width=800,scrollbars=yes'); }())";

            return (
                <a href={newWindowJs} class="new_window" title="Move To New Window" data-no-davis="true">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA0AAAANABeWPPlAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFOSURBVDiNlZS9isJAFIU/F6s0m0VYYiOrhVukWQsbK4t9CDtbexGs8xY+ghY+QRBsbKcTAjZaqKyGXX2Bs00S1AwBD1yYOXPvmXvv/CAJSQAuoGetzAPCMKRSqTzSOURRRK/Xo1wqldyEewXwfR/P8zLHIAhYr9fZ3BjDeDym1WoBUAZ+i3ZaLBYsl8s7zhiTCbwk3DfwaROYz+fsdjs6nU7GOY6TjVOBGPixCbiuy2g0YrVa0Ww2c+svlpg7DAYDptMp3W6XyWRi9RHwRXKMh8NBKYbDoQC1221dr1dtNhv1+33NZjMZY9KjtAsEQSBAvu/rfD7rEYUC2+1WjuOo0Whov9/ngm8FchcJoFarEYYhnudRrVYLe5QTOJ1OANTrdQCOx6M1MI5jexOftdsMLsBbYb7wDkTAR+KflWC9hRakr+wi6e+2hGfNTb+Bf9965Lxmndc1AAAAAElFTkSuQmCC" height="16" width="16" />
                </a>
            );
        }
    });
});