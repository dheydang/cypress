import {TEST_URL} from "../../common/constant";

context('드롭다운 메뉴', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.csInfo()
        cy.visit(TEST_URL)
    })
    it('로그인 상태 > 이름에 마우스 오버했을때 드롭다운 메뉴 내 my 메뉴 제거되었는지 확인', () => {
        cy.get('[data-test="util-name"] > .header-over-1depth').invoke('attr', 'class', 'header-over-1depth on')
        cy.get('.header-over-1depth').contains('MY').should('not.exist')
    })
})
context('utilMenu 로그인 N', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.visit(TEST_URL)
    })
    it('미로그인시 utilMenu 로그인, 이용권 이벤트 노출 확인', () => {
        cy.get('.header-nav .nav').contains('로그인').should('exist')
        cy.get('.header-nav .nav').contains('이용권').should('exist')
        cy.get('.header-nav .nav').contains('이벤트').should('exist')
        cy.get('[data-test="gnb-search"]').contains('검색하기').should('exist')
    })
})
context('로그인(이용권 미보유 또는 1회선 이용권)', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/alarms-new').as('getAlarmNew')
        cy.intercept('POST', 'https://apis.pooq.co.kr/logout').as('postLogout')
        cy.intercept('https://apis.wavve.com/es/profiles?').as('getProfiles')
        cy.intercept('POST', 'https://apis.wavve.com/es/profiles/*').as('postProfile')
        cy.intercept('https://apis.wavve.com/es/profiles-images').as('getProfileImage')
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0121', 'pooq1004!')
        cy.get('[data-test="util-name"] > .header-over-1depth').invoke('attr', 'class', 'header-over-1depth on')
    })
    it('이름 표시되며 2번째 글자의 경우 * 표시 확인', () => {
        cy.get('[data-test="util-name"]').should('contain', '*')
    })
    it('프로필 이미지 선택시 프로필 편집페이지 이동 확인', () => {
        cy.get('[data-test="single-profile"]').click()
        cy.url().should('contain', '/member/profile_edit')
    })
    it('변경할 프로필 이미지 선택시 상단 변경할 이미지로 변경되며 하단 이미지 라운처리되는지 확인', () => {
        cy.get('[data-test="single-profile"]').click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('@getProfileImage').then(({ response }) => {
            cy.get('.profile-style').eq(5).click()
            cy.get('.profile-style').eq(5).find('.check-on').should('exist')
            cy.get('.user-img img').should('have.attr', 'src', (location.protocol + '//' + response.body.list[5].image))
        })
    })
    it('확인 버튼 선택시 변경내용 저장되며 프로필 리스트 페이지로 이동되는지 확인', () => {
        cy.get('[data-test="single-profile"]').click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('.profile-style').eq(5).click()
        cy.get('[data-test="profile-edit-confirm"]').click()
        cy.wait('@postProfile').then(({ response }) => {
            expect(response.body.resultcode).eq('200')
            cy.get('[data-test="gnb-home"]').should('have.class', 'on')
        })
    })
    it('사용자 이미지 변경 취소/이전 버튼 클릭 저장되지않고 프로필 리스트로 이동', () => {
        cy.get('[data-test="single-profile"]').click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('.profile-style').eq(6).click()
        cy.get('[data-test="profile-edit-cancel"]').click()
        cy.get('[data-test="gnb-home"]').should('have.class', 'on')
    })
    it('1회선 이용권 보유시 [프로필이미지, 이름, 회원정보수정, 성인콘텐츠설정, 알림함, 로그아웃] 노출 확인', () => {
        cy.get('[data-test="single-profile"]').find('img').should('exist')
        cy.get('.header-over-1depth').find('.name').should('exist')
        cy.utilMenuDropDwon()
    })
    it('2회선 이용권 보유시 [프로필이미지, 프로필명, 사용자변, 회원정보수정, 성인콘텐츠설정, 알림함, 로그아웃] 노출 확인', () => {
        cy.get('.profile-image-area').find('img').should('exist')
        cy.get('.header-over-1depth').find('.name').should('exist')
        cy.get('.header-over-1depth').find('.change').should('exist')
        cy.utilMenuDropDwon()
    })
    it('2회선 이상 이용권 보유시 이름의 * 없음 확인', () => {
        cy.clearCookie('cs')
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.get('.user-style').eq(1).click()
        cy.get('[data-test="util-name"]').should('not.contain', '*')
    })
    // it('회원정보 수정 선택시 수정페이지 이동 확인', () => {
    //     cy.get('.header-over-1depth').contains('회원정보 수정').click()
    //     cy.url().should('contain', 'member.wavve.com/me')
    // })
    it('성인 콘첸츠 설정 선택시 성인 콘텐츠 설정 페이지로 이동', () => {
        cy.get('.header-over-1depth').contains('성인 콘텐츠 설정').click()
        cy.url().should('contain', '/setting/adult')
    })
    it('알림함 선택시 알림 팝업 노출 확인', () => {
        cy.wait('@getAlarmNew').then(async (interception) => {
            cy.get('.alarm-count').should('include.text', interception.response.body.count)
            await cy.get('.header-over-1depth').contains('알림함').click()
            cy.get('.alarm-popup').should('exist')
        })
    })
    it('로그아웃 선택시 로그아웃 정상적으로 되었는지 확인', () => {
        cy.get('.header-over-1depth').contains('로그아웃').click()
        cy.wait('@postLogout').then(({ response })=>{
            if (response.statusCode === 200) {
                cy.clearCookie('cs')
            }
        })
        cy.get('.over-parent-1depth').should('not.exist')
        cy.get('.header-nav').contains('로그인').should('exist')
    })
    it('utilmenu > 이용권 클릭 > 이용권 리스트 페이지 노출 확인', () => {
        cy.get('.nav li').contains('이용권').click()
        cy.url().should('contain', '/voucher')
    })
    it('utilmenu > 이벤트 클릭 >이벤트 리스트 페이지 노출', () => {
        cy.get('.nav li').contains('이벤트').click({ force: true })
        cy.url().should('contain', '/customer/event_list')
    })
})
context('다회선 로그인', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.intercept('https://apis.wavve.com/es/profiles?').as('getProfiles')
        cy.intercept('POST', 'https://apis.wavve.com/es/profiles/*').as('postProfile')
        cy.intercept('https://apis.wavve.com/es/profiles-images').as('getProfileImage')
        cy.intercept('GET', '/login').as('getLogin')
        cy.visit(TEST_URL)
        cy.clickUtilMenuLogin('jihye0667', 'pooqwavve1!')
        cy.wait('@getLogin')
        cy.get('[data-test="util-name"] > .header-over-1depth').invoke('attr', 'class', 'header-over-1depth on')

    })
    it('프로필명 표시되며 * 표기 없이 모두 노출되는지 확인', () => {
        cy.get('.header-over-1depth').find('.name').should('not.contain', '*')
    })
    it('사용자 변경 버튼 선택시 회선 수에 따른 프로필 갯수가 노출되는지 확인', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.wait('@getProfiles').then(({ response }) => {
            cy.get('[data-test="profile-change-user"]').should('have.length', response.body.list.length)
        })
    })
    it('임의의 프로필 선택시 선택한 프로필로 사용자 변경되며 wavve 홈으로 이동하는지 확인', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.wait('@getProfiles').then((interception) => {
            cy.get('[data-test="profile-image"]').eq(0).click({ force: true })
            cy.url().should('not.contain', '/member/profile_change')
            cy.get('[data-test="gnb-home"]').should('have.class', 'on')
        })
    })
    it('프로필 이미지 하단 연필모양 선택시 프로필 편집 페이지로 이동하는지 확인', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(2).click()
        cy.url().should('contain', '/member/profile_edit')
    })
    it('프로필 편집 이미지는 16개 노출', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(1).click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('.profile-style').should('have.length', 16)
    })
    it('변경할 프로필 이미지 선택시 상단 변경할 이미지로 변경되며 하단 이미지 라운처리되는지 확인', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(1).click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('@getProfileImage').then(({ response }) => {
            cy.get('.profile-style').eq(5).click()
            cy.get('.profile-style').eq(5).find('.check-on').should('exist')
            cy.get('.user-img img').should('have.attr', 'src', (location.protocol + '//' + response.body.list[5].image))
        })
    })
    it('확인 버튼 선택시 변경내용 저장되며 프로필 리스트 페이지로 이동되는지 확인', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(1).click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('.profile-style').eq(5).click()
        cy.get('[data-test="profile-edit-confirm"]').click()
        cy.wait('@postProfile').then(({ response }) => {
            expect(response.body.resultcode).eq('200')
            cy.url().should('contain', '/member/profile_change')
        })
    })
    it('사용자 이름 변경', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(1).click()
        cy.get('#name-change').clear()
        cy.get('#name-change').type('다라당당')
        cy.get('[data-test="profile-edit-confirm"]').click()
        cy.wait('@postProfile').then((interception) => {
            if (interception.response.body.resultcode === '200') {
                cy.get('.profile-change-name').eq(1).should('include.text', '다라당당')
            }
        })
    })
    it('사용자 이미지 변경 취소/이전 버튼 클릭 저장되지않고 프로필 리스트로 이동', () => {
        cy.get('.header-over-1depth > .change').click()
        cy.get('.profile-change-name').eq(1).click()
        cy.get('[data-test="profile-img-change"]').click()
        cy.get('.profile-style').eq(6).click()
        cy.get('[data-test="profile-edit-cancel"]').click()
        cy.wait('@getProfiles')
        cy.get('[data-test="profile-change-user"]').eq(1).find('img').should('have.attr', 'alt', '머리를 양갈래로 따고 푸른색 모자를 거꾸로 쓴 10대 여자')
        cy.url().should('contain', '/member/profile_change')
    })
})
