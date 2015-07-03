define(["dao", "globals", "ui", "lib/react", "jsx!views/components/LeagueLink", "jsx!views/components/NewWindowLink"], function (dao, g, ui, React, LeagueLink, NewWindowLink) {
    "use strict";

    return React.createClass({
        loadInbox: function () {
            return dao.messages.getAll().then(function (messages) {
                var anyUnread, i;

                messages.reverse();

                anyUnread = false;
                for (i = 0; i < messages.length; i++) {
                    messages[i].text = messages[i].text.replace(/<p>/g, "").replace(/<\/p>/g, " "); // Needs to be regex otherwise it's cumbersome to do global replace
                    if (!messages[i].read) {
                        anyUnread = true;
                    }
                }

                if (this.isMounted()) {
                    ui.title("Inbox");
                    this.setState({
                        anyUnread: anyUnread,
                        messages: messages
                    });
                }
            }.bind(this));
        },

        componentDidMount: function () {
            this.loadInbox();

            g.emitter.on('update', this.listener);
        },

        listener: function (updateEvents, cb) {
            if (updateEvents.indexOf("dbChanged") >= 0) {
                this.loadInbox().then(cb);
            } else {
                cb();
            }
        },

        componentWillUnmount: function () {
            g.emitter.removeListener('update', this.listener);
        },

        render: function () {
            var header, unreadWarning;

            header = <h1>Inbox <NewWindowLink /></h1>;

            if (this.state === null) { return header; }

            if (this.state.anyUnread) {
                unreadWarning = <p className="text-danger">You have a new message. Read it before continuing.</p>
            }

            return (
                <div>
                    {header}

                    {unreadWarning}

                    <table className="table table-striped table-bordered table-condensed" id="messages">
                        <tbody>
                            {this.state.messages.map(function (m) {
                                return (
                                    <tr key="{m.mid}" className={!m.read ? 'unread' : ''}>
                                        <td className="year"><LeagueLink parts={['message', m.mid]}>{m.year}</LeagueLink></td>
                                        <td className="from"><LeagueLink parts={['message', m.mid]}>{m.from}</LeagueLink></td>
                                        <td className="text"><LeagueLink parts={['message', m.mid]}>{m.text}</LeagueLink></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }
    });
});