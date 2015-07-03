/**
 * @name views.message
 * @namespace View a single message.
 */
define(["dao", "globals", "ui", "core/league", "lib/react", "util/viewHelpers", "jsx!views/components/LeagueLink", "jsx!views/components/NewWindowLink"], function (dao, g, ui, league, React, viewHelpers, LeagueLink, NewWindowLink) {
    "use strict";

    var Message = React.createClass({
        loadMessage: function () {
            var message, readThisPageview, tx;

            tx = dao.tx("messages", "readwrite");

            readThisPageview = false;

            // If mid is null, this will open the *unread* message with the highest mid
            dao.messages.iterate({
                ot: tx,
                key: this.props.mid,
                direction: "prev",
                callback: function (messageLocal, shortCircuit) {
                    message = messageLocal;

                    if (!message.read) {
                        shortCircuit(); // Keep looking until we find an unread one!

                        message.read = true;
                        readThisPageview = true;

                        return message;
                    }
                }
            });

            tx.complete().then(function () {
                league.updateLastDbChange();

                if (readThisPageview) {
                    if (g.gameOver) {
                        ui.updateStatus("You're fired!");
                    }

                    return ui.updatePlayMenu(null);
                }
            }).then(function () {
                if (this.isMounted()) {
                    ui.title("Message From " + message.from);
                    this.setState({message: message});
                }
            }.bind(this));
        },
        componentDidMount: function () {
            this.loadMessage();
        },
        render: function () {
            if (this.state === null) { return <div />; }

            return (
                <div>
                    <h4 style={{marginTop: "23px"}}>
                        From: <span>{this.state.message.from}</span>, <span>{this.state.message.year}</span> <NewWindowLink />
                    </h4>
                    <span dangerouslySetInnerHTML={{__html: this.state.message.text}}></span>
                    <p><LeagueLink parts={['inbox']}>Return To Inbox</LeagueLink></p>
                </div>
            );
        }
    });

    function get(req) {
        viewHelpers.beforeLeague(req).spread(function (updateEvents, cb) {
            var mid;

            mid = req.params.mid ? parseInt(req.params.mid, 10) : null;

            React.render(
              <Message mid={mid} />,
              document.getElementById('league_content')
            );
        });
    }

    return {
        get: get
    };
});