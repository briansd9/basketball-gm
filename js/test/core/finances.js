const assert = require('assert');
const db = require('../../db');
const g = require('../../globals');
const league = require('../../core/league');
const finances = require('../../core/finances');

describe("core/finances", function () {
    before(function () {
        return db.connectMeta().then(function () {
            return league.create("Test", 0, undefined, 2013, false);
        });
    });
    after(function () {
        return league.remove(g.lid);
    });

    describe("#assessPayrollMinLuxury()", function () {
        it("should store payroll and appropriately assess luxury and minimum payroll taxes for each team", function () {
            return g.dbl.tx(["players", "releasedPlayers", "teamSeasons"], "readwrite", function (tx) {
                return finances.assessPayrollMinLuxury(tx).then(function () {
                    return tx.teamSeasons.getAll().then(function (teamSeasons) {
                        var i;

                        assert.equal(teamSeasons.length, g.numTeams);

                        for (i = 0; i < g.numTeams; i++) {
                            assert(teamSeasons[i].payrollEndOfSeason > 0);

                            if (teamSeasons[i].payrollEndOfSeason > g.luxuryPayroll) {
                                assert.equal(teamSeasons[i].expenses.luxuryTax.amount, g.luxuryTax * (teamSeasons[i].payrollEndOfSeason - g.luxuryPayroll));
                            } else {
                                assert.equal(teamSeasons[i].expenses.luxuryTax.amount, 0);
                            }

                            if (teamSeasons[i].payrollEndOfSeason < g.minPayroll) {
                                assert.equal(teamSeasons[i].expenses.minTax.amount, g.minPayroll - teamSeasons[i].payrollEndOfSeason);
                            } else {
                                assert.equal(teamSeasons[i].expenses.minTax.amount, 0);
                            }
                        }
                    });
                });
            });
        });
    });
});
