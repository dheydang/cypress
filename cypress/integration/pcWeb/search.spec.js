import {TEST_URL} from "../../common/constant";
context('검색 기본화면', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.SearchTooltip()
        cy.intercept('https://apis.wavve.com/search/popular/keywords/vod').as('getSearchKeyword')
        cy.intercept('https://apis.wavve.com/tags/groups?type=vodsearch_dark').as('getVodTagGroup')
        cy.intercept('https://apis.wavve.com/cf/tagsearch?').as('getTagSearch')
        cy.intercept('https://apis.wavve.com/cf/search?').as('getSearch')
        cy.intercept('https://apis.wavve.com/search/popular/keywords/movie').as('getPopularKeywordMovie')
        cy.intercept('https://apis.wavve.com/search/instance/keywords').as('getSearchInstanceKeyword')
        cy.intercept('https://apis.wavve.com/cf/search/recommend/searchkeywords').as('getRecommendSearchKeywords')
        cy.intercept('https://apis.wavve.com/tags/groups?type=moviesearch').as('getMovieTagGroup')
        cy.visit(TEST_URL)
    })
    it('gnb 검색하기 버튼 선택 > 검색 팝업 노출 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('#searchPop').should('exist')
        cy.get('.sh-pop-list01').should('exist')
        cy.get('[data-test="popup-tag-search-btn"]').should('exist')
    })
    it('실시간 인기검색어 / 태그로 검색하기 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('.sh-pop-list01').should('exist')
        cy.get('[data-test="popup-tag-search-btn"]').should('exist')
    })
    it('실시간 인기 검색어 > 실시간 인기검색어 디폴트로 vod 선택 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-popular-tab"]').contains('VOD').should('have.class', 'col-white')
    })
    it('실시간 인기 검색어 > 라이브 선택시 실시간 인기검색어 1-10위까지 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-popular-tab"]').contains('LIVE').click()
        cy.get('.sh-pop-list01 li').should('have.length', 10)
    })
    it('실시간 인기 검색어 > 영화 선택시 실시간 인기검색어 1~10위까지 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-popular-tab"]').contains('영화').click()
        cy.get('.sh-pop-list01 li').should('have.length', 10)
    })
    it('실시간 인기 검색어 > VOD or LIVE or 영화 임의 검색어 선택시 정상적으로 이동되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-popular-tab"]').contains('영화').click()
        cy.wait('@getPopularKeywordMovie')
        cy.get('[data-test="popup-search-popular-tab"]').contains('영화').should('have.class', 'col-white')
    })
    it('태그검색 > 태그 검색 선택 시 #태그검색 페이지로 이동 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.wait('@getVodTagGroup')
        cy.get('[data-test="popup-text-search-btn"]').should('exist')
    })
    it('태그검색 > vod 선택시 방영요일, 장르, 채널, 방영여부 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.wait('@getVodTagGroup').then(({ response }) => {
            response.body.taggrouptitlelist.forEach((titleItem, index) => {
                cy.get('.hashtag-tit').contains(titleItem.title).should('exist')
            })
        })
    })
    it('태그검색 > 영화 선택시 장르, 개봉연도, 국가, 관란람등급 기타 등등 타이틀 여부 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.wait('@getMovieTagGroup').then(({ response }) => {
            cy.get('[data-test="popup-tag-search-movie"]').click()
            response.body.taggrouptitlelist.forEach((titleItem, index) => {
                cy.get('.hashtag-tit').contains(titleItem.title).should('exist')
            })
        })

    })
    // tc 말고 따로 추가 부분
    it('gnb 검색하기 > 태그로 검색하기 > 영화 탭 선택 > 탭 변경 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.wait('@getVodTagGroup')
        cy.get('[data-test="popup-tag-search-movie"]').click()
        cy.get('[data-test="popup-tag-search-movie"]').should('have.class', 'pop-header-nav-on')
    })
    it('gnb 검색하기 > 태그로 검색하기 > 태그 선택 후 검색 > localStorage 확인 및 태그 검색 화면 이동 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.get('#tag000').click({force: true})
        cy.get('#tag100').click({force: true})
        cy.get('[data-test="popup-tag-select-search"]').click({force: true})
        cy.wait('@getTagSearch').then(() => {
            expect(localStorage.getItem('search-broadcast')).eq( 'vodweekdaytag|월|월&vodsubgenretag|버라이어티|vsg02001')
        })
        cy.url().should('contain', '/search/search_tag')
    })
    it('gnb 검색하기 > 태그 검색하기 > 태그 선택 초기화 버튼 선택시 선택된 태그 해제 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.get('#tag000').click({force: true})
        cy.get('[data-test="popup-tag-select-reset"]').click({force: true})
        cy.get('#tag000').should('not.be.checked')
    })
    it('태그 리스트 스크롤 제일 하단까지 스크롤되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-tag-search-btn"]').click()
        cy.get('.tag-search-popup-scroll').scrollTo('bottom', { easing: 'linear', duration: 1000 })
        cy.wait('@getVodTagGroup').then((interception) => {
            const tagGroupList = interception.response.body.taggrouptitlelist
            const tagsListLastIndex = tagGroupList.length - 1
            cy.get('.hashtag-tit').contains(tagGroupList[tagsListLastIndex].title).should('be.visible')
        })
    })
    it('태그 팝업 x 버튼 선택시 팝업 닫힘 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-close"]').click()
        cy.get('#searchPop').should('not.exist')
    })
    it('검색 결과 초기 1회 툴팁 x 버튼 선택시 툴팁 쿠키값 생성 확인', () => {
        cy.clearCookie('tooltip')
        cy.getCookie('tooltip').should('be.null')
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').type('무한도전').type('{enter}')
        cy.wait('@getSearchInstanceKeyword')
        cy.getCookie('tooltip').should('have.property', 'value', '%7B%22search%22%3Atrue%7D')
    })
    it('팝업 검색어 입력후 검색시 검색화면으로 이동 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').type('무한도전').type('{enter}')
        cy.wait('@getSearch').then((interception) => {
            expect(interception.request.url).to.include('keyword=%EB%AC%B4%ED%95%9C%EB%8F%84%EC%A0%84')
        })
        cy.url().should('contain', '/search/search')
    })
    it('실시간 인기검색어 선택시 선택한 검색어 검색화면 노출 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="rank-search-item"]').eq(0).click({force: true})
        cy.wait('@getSearchInstanceKeyword')
        cy.url().should('contain', '/search/search')
    })
})
context('최근검색어', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.SearchTooltip()
        cy.intercept('https://apis.wavve.com/search/popular/keywords/vod').as('getSearchKeyword')
        cy.intercept('https://apis.wavve.com/cf/search/recommend/searchkeywords').as('getRecommendSearchKeywords')
        cy.visit(TEST_URL)
    })
    it('검색어 x > 최근 검색어 없을 경우 추천검색어/카테고리 키워드 최대 10개까지 표시되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('.search-empty').should('exist')
        cy.get('.search-body-tag').should('exist')
    })
    it('검색어 x > 추천검색어 선택시 해당 장르 또는 에디터픽등 상세페이지로 이동되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('[data-test="search-recommend-tag"]').eq(0).click()
        cy.wait('@getRecommendSearchKeywords').then(({ response }) => {
            cy.location().should((loc) => {
                expect(loc.href.replace(loc.protocol, '').replace(loc.origin, '').toUpperCase()).to.include((response.body[0].link).toUpperCase())
            })
        })
    })
    it('검색어 O > 검색어 입력란 선택시 최근 검색어 노출되는지 확인', () => {
        cy.searchHistory()
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('[data-test="recent-search"]').eq(0).should('exist')
    })
    it('검색어 O > 검색어 입력란 선택시 최근 검색어 선택시 검색 상세화면으로 이동', () => {
        cy.searchHistory()
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('[data-test="recent-search"]').eq(0).should('exist')
    })
    it('검색어 O > 검색어 단건 삭제 동작 확인', () => {
        cy.searchHistory()
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('[data-test="recent-search-delete"]').first().click().should(() => {
            expect(localStorage.getItem('search-history')).to.eq('어부&전참시&미우새&골목식당&어바웃타임&표리부동&골&동상이몽&해리포터&런닝맨&나혼자산다&해리&아리랑&무한')
        })
    })
    it('검색어 O > 검색어 전체삭제 후 추천 검색어 노출 확인', () => {
        cy.searchHistory()
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('[data-test="recent-search-all-delete"]').click().should(() => {
            expect(localStorage.getItem('search-history')).to.eq(null)
        })
        cy.get('.search-empty').should('exist')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.wait('@getRecommendSearchKeywords').then(({ response }) => {
            cy.get('[data-test="search-recommend-tag"]').should('have.length', response.body.length)
        })
    })
    it('최근 검색어가 많을 경우 스크롤 처리 되는지 확인', () => {
        cy.searchHistory()
        cy.visit(TEST_URL)
        cy.get('[data-test="gnb-search"]').click()
        cy.wait('@getSearchKeyword')
        cy.get('[data-test="popup-search-text-input"]').click()
        cy.get('.sh-pop-list01 > li').last().should('not.be.visible')
        cy.get('.sh-pop-list01 > li').last().scrollIntoView()
        cy.get('.sh-pop-list01 > li').last().should('be.visible')
    })
})
context('자동완성', () => {
    beforeEach(() => {
        cy.wavveonOff()
        cy.homePopupOff()
        cy.SearchTooltip()
        cy.intercept('https://apis.wavve.com/search/instance/keywords').as('getSearchInstanceKeyword')
        cy.visit(TEST_URL)
    })
    it('검색어 입력란에 글자 입력시 자동완성 검색어 vod, movie 노출 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.get('[data-test="popup-search-text-input"]').type('무')
        cy.wait('@getSearchInstanceKeyword').then(({ response }) => {
            cy.get('.popup-component-wrap').should('exist')
            cy.get('[data-test="vod-auto-keyword"]').should('have.length', response.body[1].list.length)
            cy.get('[data-test="movie-auto-keyword"]').should('have.length', response.body[2].list.length)
        })
    })
    it('자동완성 결과 많을 경우 스크롤 마지막 결과까지 노출 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.get('[data-test="popup-search-text-input"]').type('무')
        cy.get('[data-test="movie-auto-keyword"]').last().scrollIntoView().should('be.visible')
    })
    it('자동완성 영역 내의 임의의 타이틀 선택시 해당 상세페이지 이동 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.get('[data-test="popup-search-text-input"]').type('무')
        cy.wait('@getSearchInstanceKeyword').then(({ response }) => {
            cy.get('[data-test="vod-auto-keyword"]').eq(0).find('a').click({ force: true })
            cy.url().should('contain', '/player/vod')
            cy.url().should('contain', response.body[1].list[0].programid)
        })
    })
    it('프로그램 최대 10개, 영화 최대 10 총 20개 노출되는지 확인', () => {
        cy.get('[data-test="gnb-search"]').click()
        cy.get('[data-test="popup-search-text-input"]').type('아')
        cy.wait('@getSearchInstanceKeyword').then(({ response }) => {
            cy.log(response)
            const vodCount = response.body[1].count
            const movieCount = response.body[2].count
            cy.get('[data-test="vod-auto-keyword"]').should('have.length', vodCount)
            cy.get('[data-test="movie-auto-keyword"]').should('have.length', movieCount)
        })

    })
})
context('검색결과 화면 - 검색어 화면', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.setCookie('tooltip', '%7B%22search%22%3Atrue%7D')
        cy.intercept('https://apis.wavve.com/cf/search/list.js').as('getSearchList')
        cy.intercept('https://apis.wavve.com/search/instance/keywords').as('getSearchInstanceKeyword')
        cy.intercept('https://apis.wavve.com/cf/search/recommend/searchkeywords').as('getRecommendSearchKeywords')
        cy.intercept('https://apis.wavve.com/search?').as('getCustomerSearch')
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '무한' }})
    })
    it('검색 결과 없을 경우, 추천 검색어/카테고리 노출 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: 'ㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴ' }})
        cy.get('.search-empty').should('exist')
        cy.get('.search-body-tag').should('exist')
    })
    it('검색 결과 없을 경우 추천 검색어/카테고리 노출 > 추천검색어 선택시 해당 장르 또는 에디터픽 상세페이지로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: 'ㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴㅇㄹㅁㄴ' }})
        cy.wait('@getRecommendSearchKeywords').then(({ response }) => {
            cy.get('[data-test="search-recommend-item"]').should('have.length', response.body.length)
            cy.get('[data-test="search-recommend-item"]').eq(0).click({ force: true })
            cy.url().should('contain', response.body[0].link.split('?')[0])
        })
    })
    it('검색어 입력후 검색시도시 각 탭 정상 노출 확인', () => {
        const tabList = ['프로그램', '에피소드', '영화', '영화플러스', 'LIVE', '에디터Pick', '고객지원']
        cy.get('[data-test="search-tab-list"]').contains('전체').parent().should('have.class', 'nav-depth-on')
        tabList.forEach((tab) => {
            cy.get('[data-test="search-tab-list"] > li').contains(tab).click()
            cy.get('[data-test="search-tab-list"] > li').contains(tab).parent().should('have.class', 'nav-depth-on')
        })
    })
    it('프로그램 컨텐츠 선택시 해당 컨텐츠 상세페이지로 이동 확인', () => {
        cy.get('[data-test="프로그램"]').find('[data-test="portrait-cell"]').eq(0).click({ force: true })
        cy.url().should('contain', '/player/vod')
    })
    it('프로그램 더보기 버튼 선택시 프로그램 탭으로 이동', () => {
        cy.get('[data-test="프로그램"]').find('.btn-more').click({ force: true })
        cy.get('[data-test="search-tab-list"]').contains('프로그램').parent().should('have.class', 'nav-depth-on')
    })
    it('에피소드 컨텐츠 선택시 해당 컨텐츠 상세페이지로 이동 확인', () => {
        cy.get('[data-test="에피소드"]').find('[data-test="landscape-cell"]').eq(0).click({ force: true })
        cy.url().should('contain', '/player/vod')
    })
    it('에피소드 더보기 버튼 선택 에피소드 탭 이동 확인', () => {
        cy.get('[data-test="에피소드"]').find('.btn-more').click({ force: true })
        cy.get('[data-test="search-tab-list"]').contains('에피소드').parent().should('have.class', 'nav-depth-on')
    })
    it('LIVE 컨텐츠 선택시 해당 컨텐츠 상세페이지로 이동 확인', () => {
        cy.get('[data-test="LIVE"]').find('[data-test="landscape-cell"]').eq(0).click({ force: true })
        cy.url().should('contain', '/player/live')
    })
    it('LIVE 더보기 선택시 live 탭으로 이동 확인', () => {
        cy.get('[data-test="LIVE"]').find('.btn-more').click({ force: true })
        cy.get('[data-test="search-tab-list"]').contains('LIVE').parent().should('have.class', 'nav-depth-on')
    })
    it('영화 컨텐츠 선택시 해당 컨텐츠 상세페이지로 이동 확인', () => {
        cy.get('[data-test="영화"]').find('[data-test="portrait-cell"]').eq(0).click({ force: true })
        cy.url().should('contain', '/player/movie')
    })
    it('영화 더보기 선택시 영화 탭으로 이동 확인', () => {
        cy.get('[data-test="영화"]').find('.btn-more').click({ force: true })
        cy.get('[data-test="search-tab-list"]').contains('영화').parent().should('have.class', 'nav-depth-on')
    })
    it('영화플러스 컨텐츠 선택시 해당 컨텐츠 상세페이지로 이동 확인', () => {
        cy.get('[data-test="영화플러스"]').find('[data-test="portrait-cell"]').eq(0).click({ force: true })
        cy.url().should('contain', '/player/movie')
    })
    it('영화플러스 더보기 선택시 영화 탭으로 이동 확인', () => {
        cy.get('[data-test="영화플러스"]').find('.btn-more').click({ force: true })
        cy.get('[data-test="search-tab-list"]').contains('영화플러스').parent().should('have.class', 'nav-depth-on')
    })
    it('영화 결과 18~21 콘텐츠 포스터 이미지 우측 상단에 청불 아이콘', () => {
        cy.intercept('https://apis.wavve.com/cf/search/band.js?type=movie').as('getMovieContents')
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '형수' }})
        cy.wait('@getMovieContents').then(({ response }) => {
            const list = response.body.band.celllist
            list.forEach((item, index) => {
                if (18 <= Number(item.age)) {
                    cy.get('[data-test="영화"]').find('[data-test="cell"]').eq(index).find('.tag-age img').should('have.attr', 'alt', '청소년 관람 불가')
                }
            })
        })
    })
    it('영화 결과 21등급 콘텐츠는 성인 콘텐츠 잠금일 경우 포스터 가운데 청불 문구 dimmed처리 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/search/band.js?type=movie').as('getMovieContents')
        cy.setCookie('adult-settings', 'L')
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '형수' }})
        cy.wait('@getMovieContents').then(({ response }) => {
            const list = response.body.band.celllist
            list.forEach((item, index) => {
                if (21 <= Number(item.age)) {
                    cy.get('[data-test="영화"]').find('[data-test="cell"]').eq(index).find('.movie-lock-21').should('exist')
                }
            })
        })
    })
    it('영화 결과 21등급 콘텐츠는 성인 콘텐츠 차단하지않일 경우 포스터 가운데 청불 문구 dimmed처리 확인', () => {
        cy.setCookie('adult-settings', 'N')
        cy.intercept('https://apis.wavve.com/cf/search/band.js?type=movie').as('getMovieContents')
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '형수' }})
        cy.wait('@getMovieContents').then(({ response }) => {
            const list = response.body.band.celllist
            list.forEach((item, index) => {
                if (21 <= Number(item.age)) {
                    cy.get('[data-test="영화"]').find('[data-test="cell"]').eq(index).find('.movie-lock-21').should('exist')
                }
            })
        })
    })
    it('영화 결과 21등급 콘텐츠는 성인 콘텐츠 숨김일 경우 노출 되지 않음 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/search/band.js?type=movie').as('getMovieContents')
        cy.setCookie('adult-settings', 'H')
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '형수' }})
        cy.wait('@getMovieContents').then(({ response }) => {
            const list = response.body.band.celllist
            list.forEach((item, index) => {
                cy.get('[data-test="영화"]').find('[data-test="cell"]').eq(index).find('.movie-lock-21').should('not.exist')
            })
        })
    })
    it('에디터픽 더보기 선택시 에디터픽 탭 이동 확인', () => {
        cy.get('.search-editorpick-title').find('[data-test="title-only-view-more"]').click()
        cy.get('[data-test="search-tab-list"]').contains('에디터Pick').parent().should('have.class', 'nav-depth-on')
    })
    it('에디터픽 밴드 더보기 선택시 해당 에디터픽 화면으로 이동 확인', () => {
        cy.get('.search-editorpick-title').next().find('.btn-more.all').eq(0).click()
        cy.url().should('contain', '/list')
        cy.get('[data-test="editor-pick-header"]').should('exist')
    })
    it('고객지원 더보기 선택시 고객지원 탭 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '성인' }})
        cy.get('.btn-more.customer').click()
        cy.get('[data-test="search-tab-list"]').contains('고객지원').parent().should('have.class', 'nav-depth-on')
    })
    it('공지사항 더보기 선택시 공지사항으로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '성인' }})
        cy.get('[data-test="search_notice"]').find('.btn-more.search-view-all-r').click()
        cy.url().should('contain', '/customer/notice_list')
    })
    it('faq 더보기 선택시 faq 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { searchWord: '성인' }})
        cy.get('[data-test="search_faq"]').find('.btn-more.search-view-all-r').click()
        cy.url().should('contain', '/customer/faq')
    })
    it('고객지원 결과 임의 글 선택시 해당 글 상세페이지로 이동 확인', () => {
        cy.get('[data-test="search_notice"]').find('table tbody tr').eq(0).find('[data-test="search-support-go-detail"]').click()
        cy.url().should('contain', '/customer/notice_view')
    })
    it('프로그램 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'program', searchWord: '무한' }})
        cy.get('[data-test="portrait-cell"]').eq(0).click()
        cy.url().should('contain', '/player/vod')
    })
    it('에피소드 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'vod', searchWord: '무한' }})
        cy.get('[data-test="landscape-cell"]').eq(0).click()
        cy.url().should('contain', '/player/vod')
    })
    it('라이브 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'live', searchWord: '무한' }})
        cy.get('[data-test="landscape-cell"]').eq(0).click()
        cy.url().should('contain', '/player/live')
    })
    it('영화 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'movie', searchWord: '간첩', mtype: 'svod' }})
        cy.get('[data-test="portrait-cell"]').eq(0).click()
        cy.url().should('contain', '/player/movie')
    })
    it('영화플러스 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'movie', searchWord: '겨울왕국', mtype: 'ppv'}})
        cy.get('[data-test="portrait-cell"]').eq(0).click()
        cy.url().should('contain', '/player/movie')
    })
    it('에디터픽 탭 > 임의의 콘텐츠 선택시 상세페이지로 이동 확인', () => {
        cy.intercept('https://apis.wavve.com/cf/search?').as('getSearch')
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'theme', searchWord: '런닝' }})
        cy.wait('@getSearch').then(({ request }) => {
            cy.get('[data-test="landscape-cell"]').eq(0).click()
            cy.url().should('contain', '/player')
        })
    })
    it('고객지원 탭 > faq 더보기 선택시 Faq 상세페이지로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'customer', searchWord: '이용' }})
        cy.wait('@getCustomerSearch').then(() => {
            cy.get('[data-test="search_faq"]').find('.btn-more.search-view-all-r').click()
            cy.url().should('contain', '/customer/faq')
        })
    })
    it('고객지원 탭 > 공지사항 더보기 선택시 공지사항 상세페이지로 이동하는지 확인', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'customer', searchWord: '성인' }})
        cy.get('[data-test="search_notice"]').find('.btn-more.search-view-all-r').click()
        cy.url().should('contain', '/customer/notice_list')
    })
    it('고객지원 탭 > 공지사항 임의의 항목 선택시 상세페이지로 이동', () => {
        cy.visit(TEST_URL + '/search/search', {qs: { category: 'customer', searchWord: '성인' }})
        cy.get('[data-test="search_notice"]').find('[data-test="search-support-go-detail"]').eq(0).click()
        cy.url().should('contain', '/customer/notice_view')
    })
    // TODO: 웹접근성 수정후 확인
    it('새로운 단어 검색 검색내용 변경 화면 노출 확인', () => {
        cy.get('[data-test="search-detail-input"]').click()
        cy.get('[data-test="search-detail-input"]').focus().clear()
        cy.get('[data-test="search-detail-input"]').type('런닝맨{enter}')
        cy.get('[data-test="프로그램"]').find('[data-test="portrait-cell"]').eq(0).find('.col-vari-blue').contains('런닝맨').should('exist')
    })
})
context('태그 검색 상세화면', () => {
    beforeEach(() => {
        cy.homePopupOff()
        cy.wavveonOff()
        cy.setCookie('tooltip', '%7B%22search%22%3Atrue%7D')
        localStorage.setItem('search-broadcast', 'vodweekdaytag|수|수&vodweekdaytag|목|목')
        cy.intercept('https://apis.wavve.com/cf/tagsearch/list.js?').as('getTagSearchList')
        cy.intercept('https://apis.wavve.com/cf/tagsearch?').as('getTagSearch')
        cy.visit(TEST_URL + '/search/search_tag')
    })
    it('검색된 태그 x 버튼 선택시 태그 삭제되는지 확인', () => {
        cy.get('[data-test="search-tag-text"]').first().click()
        cy.wait('@getTagSearch').then(({ response }) => {
            expect(localStorage.getItem('search-broadcast')).eq('vodweekdaytag|목|목')
        })
    })
    it('탭클릭', () => {
        cy.get('.nav-2depth-wrap').contains('프로그램').click()
        cy.reload()
        cy.wait('@getTagSearchList').then(({ response, request}) => {
            expect(request.url).to.include('type=program')
            if (response.body.cell_toplist.celllist.length > 0) {
                cy.get('.search-body').should('exist')
            } else {
                cy.get('.search-empty.dark-theme').should('exist')
            }
        })
    })
    it('태그 재검색 버튼 선택시 태그 검색창이 노출되는지 확인', () => {
        cy.get('[data-test="tag-research"]').click()
        cy.get('#searchPop').should('exist')
    })
    it('태그 재검색 버튼 선택 > 태그 선택하여 재검색 되는지 확인', () => {
        cy.get('[data-test="tag-research"]').click()
        cy.get('#tag000').click({force: true})
        cy.get('[data-test="popup-tag-select-search"]').click({force: true})
        cy.wait('@getTagSearch').then(({ response }) => {
            expect(localStorage.getItem('search-broadcast')).eq('vodweekdaytag|수|수&vodweekdaytag|목|목&vodweekdaytag|월|월')
        })
    })
    it('검색된 태그 노출 영역에 "원하는 태그를 검색해보세요" 문구 노출 및 태그 재검색 클릭 유도 문구 노출 여부 확인', () => {
        localStorage.clear()
        cy.visit(TEST_URL + '/search/search_tag')
        cy.get('.search-refresh').should('contain', '원하는 태그를 검색해보세요.')
        cy.get('.search-empty').should('contain', '태그재검색 클릭! 원하는 태그를 선택해 보세요.')
    })
    it('vod 태그 검색시 탭 프로그램, 에피소드만 노출되는지 확인', () => {
        cy.get('[data-test="tag-tab-list"] > li').should('have.length', 3)
        cy.get('[data-test="tag-tab-list"]> li').contains('프로그램').should('exist')
        cy.get('[data-test="tag-tab-list"]> li').contains('에피소드').should('exist')
    })
    it('영화 태그 검색시 탭 영화, 영화플러스 탭만 노출되는지 확인', () => {
        cy.get('[data-test="tag-research"]').click()
        cy.get('[data-test="popup-tag-search-movie"]').click()
        cy.get('#tag000').click({force: true})
        cy.get('[data-test="popup-tag-select-search"]').click()
        cy.get('[data-test="tag-tab-list"] > li').should('have.length', 3)
        cy.get('[data-test="tag-tab-list"]> li').contains('영화').should('exist')
        cy.get('[data-test="tag-tab-list"]> li').contains('영화플러스').should('exist')
    })
})
