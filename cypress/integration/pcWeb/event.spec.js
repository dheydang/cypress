import {TEST_URL} from "../../common/constant"
import eventList from '../../fixtures/event/eventList.json'
context('진행중 이벤트', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('/events-notice').as('getEventNotice')
        cy.intercept('https://apis.wavve.com/events?', (req) => {
            req.reply(eventList)
        }).as('getEvents')
        cy.intercept('https://apis.wavve.com/events-contents/*').as('getEventsContents')
        cy.visit(TEST_URL + '/customer/event_list')
    })
    it('당첨자 발표 탭 선택시 당첨자 발표 탭으로 잘 이동되는지 확인', () => {
        cy.visit(TEST_URL + '/customer/event_list').then(async () => {
            await cy.get('[data-test="event-tab"]').contains('당첨자 발표').click()
            cy.wait('@getEventNotice')
            cy.get('[data-test="event-tab"]').contains('당첨자 발표').parent().should('have.class', 'nav-depth-on')
            cy.url().should('contain', 'event_board_list')
        })
    })
    it('진행중 이벤트 첫번째 item 클릭시 이벤트 상세 페이지로 이동하는지 확인', () => {
        cy.wait('@getEvents').then(({ response }) => {
            cy.get('[data-test="event-item"]').eq(0).click()
            cy.url().should('contain', '/customer/event_view')
        })
    })
    it('이벤트 상세 페이지 하단 영화 클릭시 영화 상세 화면으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/customer/event_view?eventId=507&prevPage=1')
        cy.wait('@getEventsContents').then(async ({ response }) => {
            const list = response.body[0].list
            if (list.length > 0) {
                await cy.get('[data-test="event-view-content-item"]').eq(0).click({ force: true })
                cy.url().should('contain', list[0].movieid)
            } else {
                cy.get('.event-desc-link').should('not.exist')
            }
        })
    })
    it('이벤트 상세 페이지 목록 클릭시 이벤트 리스Î트로 이동하는지 확인', async () => {
        cy.visit(TEST_URL + '/customer/event_view?eventId=507&prevPage=1')
        await cy.get('[data-test="event-list-btn"]').click({ force: true })
        cy.url().should('contain', '/customer/event_list')
    })
    it('이벤트 상세 페이지 페이징클릭시 페이지이동하는지 확인', async () => {
        cy.visit(TEST_URL + '/customer/event_view?eventId=507&prevPage=1')
        await cy.get('[data-test="paging"] a').contains('2').click()
        cy.get('[data-test="event-view-content-item"]').last().scrollIntoView()
        cy.get('[data-test="paging"] a').contains('2').should('have.class', 'on')
        cy.url().should('contain', 'page=2')
    })
    it('이벤트 상세 페이지에서 당첨자발표탭 클릭시 당첨자발표탭으로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/customer/event_view?eventId=507&prevPage=1')
        cy.get('[data-test="event-tab"]').contains('당첨자 발표').click({force: true})
        cy.wait('@getEventNotice')
        cy.get('[data-test="event-tab"]').contains('당첨자 발표').parent().should('have.class', 'nav-depth-on')
        cy.url().should('contain', 'event_board_list')
    })
})


context('당첨자 발표', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/events?').as('getEvent')
        cy.intercept('https://apis.wavve.com/events-notice?').as('getEventNotice')
        cy.visit(TEST_URL + '/customer/event_board_list')
    })
    it('진행중 이벤트 탭 클릭시 진행중 이벤트로 이동하는지 확인', () => {
        cy.get('[data-test="event-tab"]').contains('진행중 이벤트').click()
        cy.wait('@getEvent')
        cy.get('[data-test="event-tab"]').contains('진행중 이벤트').parent().should('have.class', 'nav-depth-on')
        cy.url().should('contain', 'event_list')
    })
    it('당첨자 발표 첫번째 item 클릭시 당첨자 발표 상세페이지로 이동하는지 확인', () => {
        cy.wait('@getEventNotice').then(async ({ response }) => {
            const list = response.body.list.length
            if (list > 0) {
                await cy.get('[data-test="event-board-item"]').eq(0).click()
                cy.url().should('contain', '/customer/event_board_view')
            }
        })
    })
    it('당첨자발표 상세 페이지 목록 클릭시 당첨자 발표 리스트 페이지로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/customer/event_board_view?eventId=508&pageNum=1')
        cy.get('[data-test="event-board-list-btn"]').click({ force: true })
        cy.wait('@getEventNotice')
        cy.url().should('contain', '/customer/event_board_list')
    })
})
