import {TEST_URL} from "../../../common/constant";

context('home screenshot', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.intercept('https://apis.wavve.com/cf/supermultisections/GN51').as('getHomeMultiSection')
        cy.visit(TEST_URL)
    })
    // it('bit banner', () => {
    //     cy.screenshot('bigbanner', {capture: "viewport", overwrite: true})
    // })
    // it('portrait band', () => {
    //     cy.wait('@getHomeMultiSection').then(({response}) => {
    //         const list = response.body.multisectionlist
    //         const portraitBandIdx = Cypress._.findIndex(list, (band) => band.cell_type === 'band_10')
    //         if (portraitBandIdx > -1) {
    //             cy.get('[data-test="section-loader"]').eq(portraitBandIdx).scrollIntoView({ offset: { top: -150 } })
    //             cy.wait(100)
    //             cy.screenshot({ capture: "viewport", overwrite: true })
    //         }
    //     })
    // })
    // it('ranking band', () => {
    //     cy.wait('@getHomeMultiSection').then(({response}) => {
    //         const list = response.body.multisectionlist
    //         const rankingBandIdx = Cypress._.findIndex(list, (band) => band.cell_type === 'band_94')
    //         if (rankingBandIdx > -1) {
    //             cy.get('[data-test="section-loader"]').eq(rankingBandIdx).scrollIntoView({ offset: { top: -150 } })
    //             cy.wait(100)
    //             cy.screenshot({ capture: "viewport", overwrite: true })
    //         }
    //     })
    // })
    it('comminbsoon band', () => {
        cy.scrollTo('bottom', { duration: 3000 })
        cy.wait('@getHomeMultiSection').then(({response}) => {
            const list = response.body.multisectionlist
            const commingsoonBandIdx = Cypress._.findIndex(list, (band) => band.cell_type === 'band_82')
            if (commingsoonBandIdx > -1) {
                cy.get('[data-test="section-loader"]').eq(commingsoonBandIdx).scrollIntoView({ offset: { top: -150 } })
                cy.screenshot({ capture: "viewport", overwrite: true })
            }
        })
    })
})
