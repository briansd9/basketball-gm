define(["dao", "globals", "ui", "core/team", "lib/classnames", "lib/react", "util/helpers", "jsx!views/components/LeagueLink", "jsx!views/components/NewWindowLink"], function (dao, g, ui, team, classNames, React, helpers, LeagueLink, NewWindowLink) {
    "use strict";

    var DivisionStandings = React.createClass({
        render: function () {
            return (
                <div>
                    {this.props.divs.map(function (d) {
                        return (
                            <div key={d.name} className="table-responsive">
                                <table className="table table-striped table-bordered table-condensed standings-division">
                                    <thead>
                                        <tr><th width="100%">{d.name}</th><th>W</th><th>L</th><th>Pct</th><th>GB</th><th>Home</th><th>Road</th><th>Div</th><th>Conf</th><th>Streak</th><th>L10</th></tr>
                                    </thead>
                                    <tbody>
                                        {d.teams.map(function (t) {
                                            return (
                                                <tr key={t.tid} className={classNames({info: t.highlight})}>
                                                    <td>
                                                        <LeagueLink parts={['roster', t.abbrev, this.props.season]}>{t.region} {t.name}</LeagueLink> {t.confRank <= 8 ? '(' + t.confRank + ')' : ''}
                                                    </td>
                                                    <td>{t.won}</td>
                                                    <td>{t.lost}</td>
                                                    <td>{helpers.roundWinp(t.winp)}</td>
                                                    <td>{t.gb}</td>
                                                    <td>{t.wonHome}-{t.lostHome}</td>
                                                    <td>{t.wonAway}-{t.lostAway}</td>
                                                    <td>{t.wonDiv}-{t.lostDiv}</td>
                                                    <td>{t.wonConf}-{t.lostConf}</td>
                                                    <td>{t.streak}</td>
                                                    <td>{t.lastTen}</td>
                                                </tr>
                                            );
                                        }.bind(this))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }.bind(this))}
                </div>
            );
        }
    });

    var ConferenceStandings = React.createClass({
        render: function () {
            return (
                <table className="table table-striped table-bordered table-condensed">
                    <thead>
                        <tr><th width="100%">Team</th><th align="right">GB</th></tr>
                    </thead>
                    <tbody>
                        {this.props.teams.map(function (t, i) {
                            return (
                                <tr key={t.tid} className={classNames({separator: i === 7, info: t.highlight})}>
                                    <td>
                                        {t.rank}. <LeagueLink parts={['roster', t.abbrev, this.props.season]}>{t.region}</LeagueLink>
                                    </td>
                                    <td align="right">{t.gb}</td>
                                </tr>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
            );
        }
    });

    return React.createClass({
        updateStandings: function (season) {
            team.filter({
                attrs: ["tid", "cid", "did", "abbrev", "region", "name"],
                seasonAttrs: ["won", "lost", "winp", "wonHome", "lostHome", "wonAway", "lostAway", "wonDiv", "lostDiv", "wonConf", "lostConf", "lastTen", "streak"],
                season: season,
                sortBy: ["winp", "-lost", "won"]
            }).then(function (teams) {
                var confRanks, confTeams, confs, divTeams, i, j, k, l;

                confs = [];
                for (i = 0; i < g.confs.length; i++) {
                    confRanks = [];
                    confTeams = [];
                    l = 0;
                    for (k = 0; k < teams.length; k++) {
                        if (g.confs[i].cid === teams[k].cid) {
                            confRanks[teams[k].tid] = l + 1; // Store ranks by tid, for use in division standings
                            confTeams.push(helpers.deepCopy(teams[k]));
                            confTeams[l].rank = l + 1;
                            if (l === 0) {
                                confTeams[l].gb = 0;
                            } else {
                                confTeams[l].gb = helpers.gb(confTeams[0], confTeams[l]);
                            }
                            if (confTeams[l].tid === g.userTid) {
                                confTeams[l].highlight = true;
                            } else {
                                confTeams[l].highlight = false;
                            }
                            l += 1;
                        }
                    }

                    confs.push({name: g.confs[i].name, divs: [], teams: confTeams});

                    for (j = 0; j < g.divs.length; j++) {
                        if (g.divs[j].cid === g.confs[i].cid) {
                            divTeams = [];
                            l = 0;
                            for (k = 0; k < teams.length; k++) {
                                if (g.divs[j].did === teams[k].did) {
                                    divTeams.push(helpers.deepCopy(teams[k]));
                                    if (l === 0) {
                                        divTeams[l].gb = 0;
                                    } else {
                                        divTeams[l].gb = helpers.gb(divTeams[0], divTeams[l]);
                                    }
                                    divTeams[l].confRank = confRanks[divTeams[l].tid];
                                    if (divTeams[l].tid === g.userTid) {
                                        divTeams[l].highlight = true;
                                    } else {
                                        divTeams[l].highlight = false;
                                    }
                                    l += 1;
                                }
                            }

                            confs[i].divs.push({name: g.divs[j].name, teams: divTeams});
                        }
                    }
                }

                if (this.isMounted()) {
                    ui.title("Standing - " + season);
                    this.setState({
                        season: season,
                        confs: confs
                    });
                }
            }.bind(this));
        },

        componentDidMount: function () {
            var season;
console.log('componentDidMount Standings');
            season = helpers.validateSeason(this.props.params.season);
            this.updateStandings(season);

            g.emitter.on('update', this.listener);
        },

        listener: function (updateEvents) {
            if (updateEvents.indexOf("dbChange") >= 0 || (this.state.season === g.season && updateEvents.indexOf("gameSim") >= 0)) {
                this.updateStandings(this.state.season);
            }
        },

        componentWillUnmount: function () {
            g.emitter.removeListener('update', this.listener);
        },

        render: function () {
            var header;

            header = <h1>Standings <NewWindowLink /></h1>;

            if (this.state === null) { return header; }

            return (
                <div>
                    {header}

                    {this.state.confs.map(function (c) {
                        return (
                            <div key={c.name}>
                                <h2>{c.name}</h2>
                                <div className="row">
                                    <div className="col-sm-9">
                                        <DivisionStandings divs={c.divs} season={this.state.season} />
                                    </div>

                                    <div className="col-sm-3 hidden-xs">
                                        <ConferenceStandings teams={c.teams} season={this.state.season} />
                                    </div>
                                </div>
                            </div>
                        );
                    }.bind(this))}
                </div>
            );
        }
    });
});


/*    function uiFirst(vm) {
        ui.tableClickableRows($(".standings-division"));
    }

    function uiEvery(updateEvents, vm) {
        components.dropdown("standings-dropdown", ["seasons"], [vm.season()], updateEvents);
    }*/