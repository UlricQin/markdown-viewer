
var Popup = () => {

  var state = {
    copyStatus: '',
    copyBusy: false,
    compiler: '',
    options: {},
    content: {},
    theme: '',
    themes: {},
    _themes: [
      'wechat',
      'github',
      'github-dark',
      // 'air',
      'almond',
      'awsm',
      'axist',
      'bamboo',
      'bullframe',
      'holiday',
      'kacit',
      'latex',
      'marx',
      'mini',
      'modest',
      'new',
      'no-class',
      'pico',
      'retro',
      'sakura',
      'sakura-vader',
      'semantic',
      'simple',
      // 'splendor',
      'style-sans',
      'style-serif',
      'stylize',
      'superstylin',
      'tacit',
      'vanilla',
      'water',
      'water-dark',
      'writ',
      'custom',
    ],
    _width: [
      'auto',
      'full',
      'wide',
      'large',
      'medium',
      'small',
      'tiny',
    ],
    raw: false,
    tab: '',
    tabs: ['theme', 'compiler', 'content'],
    compilers: [],
    description: {
      themes: {},
      compiler: {},
      content: {
        autoreload: 'Auto reload on file change',
        emoji: 'Convert emoji :shortnames: into EmojiOne images',
        toc: 'Generate Table of Contents',
        mathjax: 'Render MathJax formulas',
        mermaid: 'Mermaid diagrams',
        syntax: 'Syntax highlighting for fenced code blocks',
      }
    },
    settings: {}
  }

  var events = {
    tab: (e) => {
      state.tab = e.target.hash.replace('#tab-', '')
      localStorage.setItem('tab', state.tab)
      return false
    },

    compiler: {
      name: (e) => {
        state.compiler = state.compilers[e.target.selectedIndex]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.name',
          compiler: state.compiler,
        }, () => {
          chrome.runtime.sendMessage({message: 'popup'}, init)
        })
      },
      options: (e) => {
        state.options[e.target.name] = !state.options[e.target.name]
        chrome.runtime.sendMessage({
          message: 'popup.compiler.options',
          compiler: state.compiler,
          options: state.options,
        })
      }
    },

    content: (e) => {
      state.content[e.target.name] = !state.content[e.target.name]
      chrome.runtime.sendMessage({
        message: 'popup.content',
        content: state.content,
      })
    },

    themes: (e) => {
      state.themes.width = state._width[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.themes',
        themes: state.themes,
      })
    },

    theme: (e) => {
      state.theme = state._themes[e.target.selectedIndex]
      chrome.runtime.sendMessage({
        message: 'popup.theme',
        theme: state.theme
      })
    },

    raw: () => {
      state.raw = !state.raw
      chrome.runtime.sendMessage({
        message: 'popup.raw',
        raw: state.raw
      })
    },

    defaults: () => {
      chrome.runtime.sendMessage({
        message: 'popup.defaults'
      }, () => {
        chrome.runtime.sendMessage({message: 'popup'}, init)
        localStorage.removeItem('tab')
        state._tabs.activeTabIndex = 0
      })
    },

    copyWechat: async () => {
      state.copyBusy = true
      state.copyStatus = '正在复制…'
      m.redraw()
      try {
        var [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        if (!tab) throw new Error('没有找到当前页面。')
        var source = await chrome.tabs.sendMessage(tab.id, {message: 'wechat.source'})
        if (!source || !source.markdown) throw new Error('请先打开已渲染的 Markdown 页面。')
        var result = formatWechat(source.markdown, source.url, source.images || {})
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([result.html], {type: 'text/html'}),
          'text/plain': new Blob([source.markdown], {type: 'text/plain'}),
        })])
        state.copyStatus = '已复制，可粘贴到公众号编辑器。' + (result.warnings.length ? ' ' + result.warnings.join(' ') : '')
      }
      catch (err) {
        state.copyStatus = '复制失败：' + (err.message || '请打开已渲染的 Markdown 页面后重试。')
      }
      finally {
        state.copyBusy = false
        m.redraw()
      }
    },

    advanced: () => {
      chrome.runtime.sendMessage({message: 'popup.advanced'})
    }
  }

  var init = (res) => {
    state.compiler = res.compiler
    state.options = res.options
    state.content = res.content
    state.theme = res.theme
    state.themes = res.themes

    state.raw = res.raw
    state.tab = localStorage.getItem('tab') || 'theme'
    state.compilers = res.compilers
    state.description.compiler = res.description

    state.settings = res.settings
    document.querySelector('body').classList.add(state.settings.theme)

    m.redraw()
  }

  chrome.runtime.sendMessage({message: 'popup'}, init)

  var oncreate = {
    ripple: (vnode) => {
      mdc.ripple.MDCRipple.attachTo(vnode.dom)
    },
    tabs: (vnode) => {
      state._tabs = mdc.tabs.MDCTabBar.attachTo(vnode.dom)
      setTimeout(() => {
        state._tabs.activeTabIndex = state.tabs.indexOf(state.tab)
      }, 250)
    }
  }

  var onupdate = (tab, key) => (vnode) => {
    var value = tab === 'compiler' ? state.options[key]
      : tab === 'content' ? state.content[key]
      : null

    if (vnode.dom.classList.contains('is-checked') !== value) {
      vnode.dom.classList.toggle('is-checked')
    }
  }

  var render = () =>
    m('#popup',
      // raw
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.raw
        },
        (state.raw ? 'Html' : 'Markdown')
      ),
      // defaults
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.defaults
        },
        'Defaults'
      ),

      // tabs
      m('nav.mdc-tab-bar m-tabs', {
        oncreate: oncreate.tabs,
        onclick: events.tab
        },
        state.tabs.map((tab) =>
        m('a.mdc-tab', {
          href: '#tab-' + tab,
          },
          tab
        )),
        m('span.mdc-tab-bar__indicator')
      ),
      m('.m-panels',
        // theme
        m('.m-panel', {
          class: state.tab === 'theme' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.theme
            },
            state._themes.map((theme) =>
              m('option', {selected: state.theme === theme}, theme)
            )
          ),
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.themes
            },
            state._width.map((width) =>
              m('option', {
                selected: state.themes.width === width,
              }, width)
            )
          ),
        ),
        // compiler
        m('.m-panel', {
          class: state.tab === 'compiler' ? 'is-active' : ''
          },
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.compiler.name
            },
            state.compilers.map((name) =>
              m('option', {selected: state.compiler === name}, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
            },
            Object.keys(state.options)
            .filter((key) => typeof state.options[key] === 'boolean')
            .map((key) =>
              m('label.mdc-switch m-switch', {
                onupdate: onupdate('compiler', key),
                title: state.description.compiler[key]
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  name: key,
                  checked: state.options[key],
                  onchange: events.compiler.options
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label', key)
              )
            )
          )
        ),
        // content
        m('.m-panel', {
          class: state.tab === 'content' ? 'is-active' : ''
          },
          m('.scroll', Object.keys(state.content).map((key) =>
            m('label.mdc-switch m-switch', {
              onupdate: onupdate('content', key),
              title: state.description.content[key]
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                name: key,
                checked: state.content[key],
                onchange: events.content
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label', key)
            ))
          )
        )
      ),

      m('.wechat-copy',
        m('button.mdc-button.mdc-button--raised.m-button.wechat-copy-button', {
          onclick: events.copyWechat, disabled: state.copyBusy,
        }, '复制到公众号'),
        state.copyStatus && m('.wechat-copy-status', {role: 'status'}, state.copyStatus)
      ),

      // advanced options
      m('button.mdc-button mdc-button--raised m-button', {
        oncreate: oncreate.ripple,
        onclick: events.advanced
        },
        'Advanced Options'
      )
    )

  var options = () =>
    m('.row m-settings hidden',
      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Theme'),
        m('.bs-callout m-theme',
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                'Content Theme'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.mdc-elevation--z2 m-select', {
                onchange: events.theme
                },
                state._themes.map((theme) =>
                  m('option', {selected: state.theme === theme}, theme)
                )
              )
            ),
          ),
          m('.row',
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('span.m-label',
                'Content Width'
              )
            ),
            m('.col-xxl-6.col-xl-6.col-lg-6.col-md-6.col-sm-12',
              m('select.mdc-elevation--z2 m-select', {
                onchange: events.themes
                },
                state._width.map((width) =>
                  m('option', {
                    selected: state.themes.width === width,
                  }, width)
                )
              )
            ),
          ),
          settings.render()
        ),
        state.theme === 'custom' &&
        custom.render()
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Compiler'),
        m('.bs-callout m-compiler',
          m('select.mdc-elevation--z2 m-select', {
            onchange: events.compiler.name
            },
            state.compilers.map((name) =>
              m('option', {selected: state.compiler === name}, name)
            )
          ),
          m('.scroll', {
            class: Object.keys(state.options)
              .filter((key) => typeof state.options[key] === 'boolean')
              .length > 8
              ? 'max' : ''
            },
            Object.keys(state.options)
            .filter((key) => typeof state.options[key] === 'boolean')
            .map((key) =>
              m('label.mdc-switch m-switch', {
                onupdate: onupdate('compiler', key),
                title: state.description.compiler[key]
                },
                m('input.mdc-switch__native-control', {
                  type: 'checkbox',
                  name: key,
                  checked: state.options[key],
                  onchange: events.compiler.options
                }),
                m('.mdc-switch__background', m('.mdc-switch__knob')),
                m('span.mdc-switch-label', key)
              )
            )
          )
        ),
      ),

      m('.col-xxl-4.col-xl-4.col-lg-6.col-md-6.col-sm-12',
        m('h3', 'Content'),
        m('.bs-callout m-content',
          m('.scroll', Object.keys(state.content).map((key) =>
            m('label.mdc-switch m-switch', {
              onupdate: onupdate('content', key),
              title: state.description.content[key]
              },
              m('input.mdc-switch__native-control', {
                type: 'checkbox',
                name: key,
                checked: state.content[key],
                onchange: events.content
              }),
              m('.mdc-switch__background', m('.mdc-switch__knob')),
              m('span.mdc-switch-label', key)
            ))
          )
        ),
      ),
    )

  return {state, render, options}
}

if (document.querySelector('.is-popup')) {
  var popup = Popup()
  m.mount(document.querySelector('body'), {
    view: (vnode) => popup.render()
  })
}
else {
  var settings = Settings()
  var custom = Custom()
}
