import {TEST_URL} from "../../common/constant"
import qna from '../../fixtures/customer/qna.json'
import noticeList from '../../fixtures/customer/noticeList.json'
context('공지사항', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/search/notices').as('getCustomerSearchNotice')
        cy.intercept('https://apis.wavve.com/notices?', (req) => {
            req.reply(noticeList)
        }).as('getCustomerNotice')
        cy.intercept('https://apis.wavve.com/notices/*').as('getNoticeView')
        cy.visit(TEST_URL + '/customer/notice_list')
    })
    it('공지사항내의 서브 메뉴 선택시 해당 메뉴로 이동하는지 확인', async () => {
        await cy.get('.cs-2depth').contains('서비스공지').click({ force: true })
        cy.get('[data-test="cutomer-notice-tab"]').contains('서비스공지').parent().should('have.class', 'cs-2depth-on')
    })
    it('공지사항 리스트 top 그리고 new 값이 있을 때 ui에 잘 표현되는지 확인', () => {
        cy.wait('@getCustomerNotice').then(({ response }) => {
            response.body.list.map((item, index) => {
                if(item.istop === 'y') {
                    cy.get('[data-test="notice-item"]').eq(index).should('have.class', 'noti-top')
                } else {
                    cy.get('[data-test="notice-item"]').eq(index).should('not.have.class', 'noti-top')
                }
                if (item.isNew === 'y') {
                    cy.get('[data-test="notice-title"]').eq(index).find('img').should('exist')
                } else {
                    cy.get('[data-test="notice-title"]').eq(index).find('img').should('not.exist')
                }
            })
        })
    })
    it('공지사항 궁금하신점을 입력해주세요에 임의의 검색어 입력시 잘 검색되는지 확인', () => {
        cy.get('[data-test="customer-input"]').type('무한', { force: true })
        cy.get('[data-test="customer-search-btn"]').click({ force: true })
        cy.wait('@getCustomerSearchNotice').then((interception) => {
            expect(interception.request.url).to.include('keyword=%EB%AC%B4%ED%95%9C')
        })
        cy.url().should('contain', 'searchWord=%EB%AC%B4%ED%95%9C')
    })
    it('공지사항 제목 검색어 동일할 경우 타이틀 색상 파랗게 변경되는지 확인', () => {
        cy.intercept('https://apis.wavve.com/search/notices').as('getCustomerSearchNotice')
        cy.visit(TEST_URL + '/customer/notice_list', {
            qs: {
                filterType: 'all',
                searchWord: '무한'
            }
        })
        cy.wait('@getCustomerSearchNotice').then(({ response }) => {
            const noticeList = response.body.list
            const filteredList = noticeList.filter((item) => item.noticetitle.indexOf('무한') > -1)
            cy.get('[data-test="search-word"]').should('have.length', filteredList.length)
        })
    })
    it('제목 선택시 공지사항 상세페이지로 이동하는지 확인', async () => {
        await cy.get('[data-test="notice-item"]').eq(0).find('a').click()
        cy.url().should('contain', '/customer/notice_view')
    })
    it('공지사항 상세화면 목록 선택시 공지사항 목록으로 이동하는지 확인', () => {
        cy.get('[data-test="notice-item"]').eq(0).find('a').click()
        cy.wait('@getNoticeView')
        cy.get('[data-test="list-btn"]').click({ force: true })
        cy.url().should('contain', '/customer/notice_list')
    })
})
context('자주 묻는 질문 faq', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/filters').as('getFilters')
        cy.intercept('https://apis.wavve.com/faqsrecommend').as('getFaqCommend')
        cy.intercept('https://apis.wavve.com/faqs').as('getFaqs')
        cy.intercept('https://apis.wavve.com/search/faq').as('getFaqSearch')
        cy.visit(TEST_URL + '/customer/faq')
    })
    it('tab 갯수가 api와 동일하게 노출되는지 확인', () => {
        cy.wait('@getFilters').then(({ response }) => {
            cy.get('.cs-2depth > li').should('length', response.body.faqcategory.length + 1)
        })
    })
    it('faq내의 서브 메뉴 선택시 메뉴 잘 이동되는지 확인', async () => {
        await cy.get('.cs-2depth > li').contains('재생').click({ force: true })
        cy.get('.cs-2depth > li').contains('재생').parent().should('have.class', 'cs-2depth-on')
    })
    it('쟈주하는 질문 api와 화면에 노출되는것과 동일한지 확인', () => {
        cy.wait('@getFaqCommend').then(({ response }) => {
            cy.get('.faq-top-list > li').should('length', response.body.list.length)
            cy.get('.faq-top-list > li').eq(1).click()
            cy.url().should('contain', response.body.list[1].searchkeyword)
        })
    })
    it('검색어 입력하여 검색어 검색 잘 되는지 확인', () => {
        cy.get('.cs-top-input input').type('영상')
        cy.get('.cs-search-btn').click({ force: true })
        cy.wait('@getFaqSearch').then(({ response, request }) => {
            expect(request.url).to.include('keyword=%EC%98%81%EC%83%81')
            cy.get('.cs-table > li').should('length', response.body.list.length)
        })
    })
    it('하단 더보기버튼 선택시 faq 추가 노출 되는지 확인', async () => {
        await cy.get('.cs-more').click({ force: true })
        cy.get('.cs-table > li').should('have.length', 20)
    })
    it('faq 임의의값 선택할때 선택한 faq값의 아코디언이 잘 노출되는지 확인', async () => {
        await cy.get('.cs-table > li').eq(0).find('button').click()
        cy.get('.cs-table > li').eq(0).should('have.class', 'cs-table-open')
    })
    it('faq 리스트 클릭된 상태에서 다른 faq값을 선택했을 경우 기존 faq값은 아코디언이 접히고 새로 선택한 faq 아코디언이 열리는지 확인', async () => {
        await cy.get('.cs-table > li').eq(0).find('button').click({ force: true})
        await cy.get('.cs-table > li').eq(2).find('button').click({ force: true })
        await cy.get('.cs-table > li').eq(0).should('not.have.class', 'cs-table-open')
        await cy.get('.cs-table > li').eq(2).should('have.class', 'cs-table-open')
    })
})
context('1:1 문의', () => {
    beforeEach(() => {
        cy.csInfo()
        cy.homePopupOff()
        cy.wavveonOff()
    })
    it('1:1문의하기가 1:1문의로 변경되었는지 확인', () => {
        cy.visit(TEST_URL + '/customer/user_qna')
        cy.get('[data-test="customer-header-tab"]').contains('1:1 문의하기').should('not.exist')
        cy.get('[data-test="customer-header-tab"]').contains('1:1 문의').should('exist')
    })
    it('1:1 문의하기 버튼 선택시 1:1문의하기 페이지로 이동하는지 확인', async () => {
        cy.visit(TEST_URL + '/customer/user_qna')
        await cy.get('[data-test="inquiry-btn"]').click({ force: true })
        cy.url().should('eq', 'https://member.wavve.com/customer/qna/ask')
    })
    it('나의 문의 내역 리스트  타이틀 선택 1:1문의 상세화면으로 이동하는지 확인 및 목록 클릭시 목록으로 이동 하는지 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user/qna', (req) => {
            req.reply(qna)
        }).as('getQna')
        cy.visit(TEST_URL + '/customer/user_qna')
        cy.wait('@getQna').then(async ({ response }) => {
            const list = response.body.list
            if (list.length > 0) {
                cy.get('[data-test="qna-item"]').should('length', list.length)
                await cy.get('[data-test="qna-item"]').eq(0).find('td').eq(2).click()
                cy.url().should('contain', '/user_qna_view')
                await cy.get('[data-test="qna-list"]').click({ force: true })
                cy.url().should('contain', '/customer/user_qna')
            } else {
                cy.get('.my-qa-empty').should('exist')
            }
        })
    })
    it('미로그인 나의 문의 내역일 경우 문의내역 미노출되는지 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL + '/customer/user_qna')
        cy.get('.mypooq-info-body').should('not.exist')
    })
    it('문의 내역 없을 경우 "문의 내역이 없어요"문구 노출 확인', () => {
        cy.intercept('https://apis.pooq.co.kr/user/qna', (req) => {
            qna.list = []
            req.reply(qna)
        }).as('getQna')
        cy.visit(TEST_URL + '/customer/user_qna')
        cy.wait('@getQna').then(({ response }) => {
            cy.get('.my-like-empty').should('exist')
        })
    })
})
context('이용약관', () => {
    beforeEach(() => {
        cy.csInfo()
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/terms').as('getTerms')
        cy.visit(TEST_URL + '/customer/agreement', {
            qs: {
              category: 'service',
            },
            onBeforeLoad(win) {
                cy.stub(win, 'open').as('windowOpen')
            }
        })
    })
    it('인쇄하기 선택시 윈도우 팝업 노출되는지 확인', () => {
        cy.get('[data-test="print-btn"]').click({ force: true })
        cy.window().its('open').should('be.called')
    })
    it('이전 서비스 이용약관 보기 선택시 이전 서비스 이용약관 노출 되는지 확인', () => {
        cy.wait('@getTerms').then(({ response }) => {
            cy.get('.filter-wrap').scrollIntoView()
            cy.get('.filter-item select').select('2.2')
            cy.url().should('contain', '2.2')
        })

    })
})
