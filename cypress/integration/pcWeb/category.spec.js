import {TEST_URL} from "../../common/constant";

context('전체보기', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/es/category/launcher-band?ctype=vod&').as('getCategoryVod')
        cy.intercept('https://apis.wavve.com/es/category/launcher-band?ctype=vod09&').as('getCategoryGlobal')
        cy.intercept('https://apis.wavve.com/es/category/launcher-band?ctype=movie&').as('getCategoryMovie')
        cy.intercept('https://apis.wavve.com/es/category/launcher-band?ctype=movieplus&').as('getCategoryMoviePlus')
        cy.intercept('https://apis.wavve.com/es/category/launcher-band?ctype=live&').as('getCategoryLive')
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-category"]').trigger('mouseenter')
        cy.get('[data-test="category-all-btn"]').click()
    })
    it('카테고리 > 전체 카테고리 보기 클릭시 전체화면 팝업 화면 노출되는지 확인', () => {
        cy.get('.popup-back').should(($div) => {
            expect($div).to.have.css('display', 'block')
        })
    })
    it('카테고리 > 전체카테고리 > 강조된 카테고리 확인', () => {
        cy.get('.all-category-list-layer').find('.emphasis').should('have.length.greaterThan', 0)
    })
    it('카테고리 선택 시 페이지 이동되는지 확인', () => {
        cy.get('.all-category-list li a').first().click()
        cy.get('.category-list-layer').should(($div) => {
            expect($div).to.have.css('display', 'none')
        })
        cy.url().should('not.eq', TEST_URL)
    })
    it('카테고리 > 전체 카테고리 > x 버튼 선택시 전체화면 닫히는지 확인', () => {
        cy.get('[data-test="category-popup-close"]').click()
        cy.get('.popup-back').should(($div) => {
            expect($div).to.have.css('display', 'none')
        })
    })
    it('카테고리 > 전체 카테고리 스크롤 정상동작하는지 확인', () => {
        cy.get('.all-category-list').scrollTo('bottom', { easing: 'linear', duration: 1000 })
    })
    it('방송 카테고리 선택', () => {
        cy.wait('@getCategoryVod').then(({ response }) => {
            response.body.band.celllist.forEach((item, index) => {
                cy.get('[data-test="category_방송"').find('ul > li').eq(index).find('a').click({ force: true })
                cy.url().should('contain', (item.event_list[1].url).replace('https://', '').split('?')[0])
            })
        })
    })
    it('해외시리즈 카테고리 선택', () => {
        cy.wait('@getCategoryGlobal').then(({ response }) => {
            response.body.band.celllist.forEach((item, index) => {
                cy.get('[data-test="category_해외시리즈"').find('ul > li').eq(index).find('a').click({ force: true })
                cy.url().should('contain', (item.event_list[1].url).replace('https://', '').split('?')[0])
            })
        })
    })
    it('영화 카테고리 선택', () => {
        cy.wait('@getCategoryMovie').then(({ response }) => {
            response.body.band.celllist.forEach((item, index) => {
                cy.get('[data-test="category_영화"').find('ul > li').eq(index).find('a').click({ force: true })
                cy.url().should('contain', (item.event_list[1].url).replace('https://', '').split('?')[0])
            })
        })
    })
    it('영화플러스 카테고리 선택', () => {
        cy.wait('@getCategoryMoviePlus').then(({ response }) => {
            response.body.band.celllist.forEach((item, index) => {
                cy.get('[data-test="category_영화플러스"').find('ul > li').eq(index).find('a').click({ force: true })
                cy.get('#snackbar').should('exist')
                cy.url().should('contain', (item.event_list[1].url).replace('https://', '').split('?')[0])
            })
        })
    })
    it('라이브 카테고리 선택', () => {
        cy.wait('@getCategoryLive').then(({ response }) => {
            response.body.band.celllist.forEach((item, index) => {
                cy.get('[data-test="category_LIVE"').find('ul > li').eq(index).find('a').click({ force: true })
                cy.url().should('contain', (item.event_list[1].url).replace('https://', '').split('?')[0])
            })
        })
    })
})
context('추천', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('apis.wavve.com/es/category/launcher-band?ctype=movieplus').as('getMoviePlus')
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-category"]').trigger('mouseenter')
    })
    it('카테고리 > 추천 메뉴 > item 선택시 item 화면으로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').first().click()
        cy.get('.category-list-layer').should(($div) => {
            expect($div).to.have.css('display', 'none')
        })
        cy.url().should('not.eq', TEST_URL)
    })
    it('카테고리 > 영화플러스 toast 노출되는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('영화플러스').click({ force: true })
        cy.wait('@getMoviePlus')
        cy.get('#snackbar').should('exist')
        cy.wait(2000)
        cy.get('#snackbar').should('not.exist')
    })
    it('드라마 선택시 해당 카테고리 메뉴로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('드라마').click()
        cy.get('.page-title').should('contain', '드라마')
    })
    it('예능 선택시 해당 카테고리 메뉴로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('예능').click()
        cy.get('.page-title').should('contain', '예')
    })
    it('영화 선택시 해당 카테고리 메뉴로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('영화').click()
        cy.get('.page-title').should('contain', '영화')
    })
    it('영화플러스 선택시 해당 카테고리 메뉴로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('영화플러스').click()
        cy.get('.page-title').should('contain', '영화 플러스')
    })
    it('해외시리즈 선택시 해당 카테고리 메뉴로 이동하는지 확인', () => {
        cy.get('[data-test="category-recommend-item"]').contains('해외시리즈').click()
        cy.get('.page-title').should('contain', '해외시리즈')
    })
})
