/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/ThemeModeContext.tsx":
/*!**********************************!*\
  !*** ./lib/ThemeModeContext.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ThemeModeContext: () => (/* binding */ ThemeModeContext),\n/* harmony export */   useThemeMode: () => (/* binding */ useThemeMode)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n\nconst ThemeModeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({\n    mode: \"light\",\n    toggle: ()=>{}\n});\nfunction useThemeMode() {\n    return (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(ThemeModeContext);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvVGhlbWVNb2RlQ29udGV4dC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUF5RDtBQVNsRCxNQUFNRyxpQ0FBbUJGLG9EQUFhQSxDQUF3QjtJQUNuRUcsTUFBTTtJQUNOQyxRQUFRLEtBQU87QUFDakIsR0FBRztBQUVJLFNBQVNDO0lBQ2QsT0FBT0osaURBQVVBLENBQUNDO0FBQ3BCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWRtLWJ1aWxkZXIvLi9saWIvVGhlbWVNb2RlQ29udGV4dC50c3g/Y2JlMSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IHR5cGUgVGhlbWVNb2RlID0gJ2xpZ2h0JyB8ICdkYXJrJztcblxudHlwZSBUaGVtZU1vZGVDb250ZXh0VmFsdWUgPSB7XG4gIG1vZGU6IFRoZW1lTW9kZTtcbiAgdG9nZ2xlOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGNvbnN0IFRoZW1lTW9kZUNvbnRleHQgPSBjcmVhdGVDb250ZXh0PFRoZW1lTW9kZUNvbnRleHRWYWx1ZT4oe1xuICBtb2RlOiAnbGlnaHQnLFxuICB0b2dnbGU6ICgpID0+IHt9LFxufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VUaGVtZU1vZGUoKSB7XG4gIHJldHVybiB1c2VDb250ZXh0KFRoZW1lTW9kZUNvbnRleHQpO1xufVxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJUaGVtZU1vZGVDb250ZXh0IiwibW9kZSIsInRvZ2dsZSIsInVzZVRoZW1lTW9kZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/ThemeModeContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyApp)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _styles_module_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/module.css */ \"./styles/module.css\");\n/* harmony import */ var _styles_module_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_styles_module_css__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var prismjs_themes_prism_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! prismjs/themes/prism.css */ \"./node_modules/prismjs/themes/prism.css\");\n/* harmony import */ var prismjs_themes_prism_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(prismjs_themes_prism_css__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _mui_material_styles__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mui/material/styles */ \"@mui/material/styles\");\n/* harmony import */ var _mui_material_CssBaseline__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @mui/material/CssBaseline */ \"@mui/material/CssBaseline\");\n/* harmony import */ var _lib_ThemeModeContext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../lib/ThemeModeContext */ \"./lib/ThemeModeContext.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_mui_material_styles__WEBPACK_IMPORTED_MODULE_6__, _mui_material_CssBaseline__WEBPACK_IMPORTED_MODULE_7__]);\n([_mui_material_styles__WEBPACK_IMPORTED_MODULE_6__, _mui_material_CssBaseline__WEBPACK_IMPORTED_MODULE_7__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n// MUI foundation setup\n\n\n\nfunction makeTheme(mode) {\n    const isDark = mode === \"dark\";\n    return (0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_6__.createTheme)({\n        palette: {\n            mode,\n            background: {\n                default: isDark ? \"#0b0f14\" : \"#f5f6fa\",\n                paper: isDark ? \"#0f141a\" : \"#fff\"\n            },\n            primary: {\n                main: \"#718ec0\",\n                dark: \"#3f5b80\"\n            }\n        },\n        typography: {\n            fontFamily: \"'Montserrat', Arial, 'Helvetica Neue', Helvetica, sans-serif\",\n            fontSize: 12\n        },\n        shape: {\n            borderRadius: 6\n        },\n        components: {\n            MuiButton: {\n                defaultProps: {\n                    size: \"medium\",\n                    variant: \"contained\",\n                    disableElevation: true\n                },\n                styleOverrides: {\n                    root: {\n                        textTransform: \"none\",\n                        borderRadius: 6,\n                        backgroundColor: \"var(--color-primary)\",\n                        color: \"#ffffff\",\n                        \"&:hover\": {\n                            backgroundColor: \"var(--color-primary-dark)\"\n                        }\n                    }\n                }\n            },\n            MuiIconButton: {\n                defaultProps: {\n                    size: \"small\"\n                },\n                styleOverrides: {\n                    root: {\n                        padding: 8,\n                        color: \"var(--icon-color)\",\n                        transition: \"color 0.2s ease, background-color 0.2s ease\",\n                        \"&:hover\": {\n                            color: \"var(--icon-color-hover)\",\n                            backgroundColor: \"var(--icon-hover-bg)\"\n                        }\n                    }\n                }\n            },\n            MuiSvgIcon: {\n                defaultProps: {\n                    fontSize: \"small\",\n                    color: \"inherit\"\n                }\n            },\n            MuiTextField: {\n                defaultProps: {\n                    size: \"small\",\n                    variant: \"outlined\"\n                }\n            },\n            MuiSelect: {\n                defaultProps: {\n                    size: \"small\",\n                    variant: \"outlined\"\n                }\n            },\n            MuiSlider: {\n                defaultProps: {\n                    size: \"small\"\n                }\n            },\n            MuiOutlinedInput: {\n                styleOverrides: {\n                    root: {\n                        borderRadius: 6\n                    }\n                }\n            },\n            MuiDialog: {\n                styleOverrides: {\n                    paper: {\n                        backgroundImage: \"none\",\n                        backgroundColor: isDark ? \"#11161d\" : \"#fff\"\n                    }\n                }\n            },\n            MuiPaper: {\n                styleOverrides: {\n                    root: {\n                        backgroundImage: \"none\"\n                    }\n                }\n            },\n            MuiAppBar: {\n                styleOverrides: {\n                    root: {\n                        backgroundColor: isDark ? \"#0b0f14\" : \"#F5F6FA\",\n                        boxShadow: \"none\",\n                        borderBottom: \"1px solid\",\n                        borderColor: isDark ? \"rgba(255,255,255,0.12)\" : \"rgba(0,0,0,0.12)\"\n                    }\n                }\n            }\n        }\n    });\n}\nfunction MyApp({ Component, pageProps }) {\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [mode, setMode] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"light\");\n    // Initialize from localStorage or prefers-color-scheme\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        try {\n            const saved =  false ? 0 : null;\n            if (saved === \"light\" || saved === \"dark\") {\n                setMode(saved);\n                return;\n            }\n        } catch  {}\n        if (false) {}\n    }, []);\n    const theme = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(()=>makeTheme(mode), [\n        mode\n    ]);\n    const ctx = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(()=>({\n            mode,\n            toggle: ()=>{\n                setMode((m)=>{\n                    const next = m === \"dark\" ? \"light\" : \"dark\";\n                    try {\n                        localStorage.setItem(\"edm-theme-mode\", next);\n                    } catch  {}\n                    return next;\n                });\n            }\n        }), [\n        mode\n    ]);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (typeof document !== \"undefined\") {\n            document.documentElement.setAttribute(\"data-theme\", mode);\n        }\n    }, [\n        mode\n    ]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_ThemeModeContext__WEBPACK_IMPORTED_MODULE_8__.ThemeModeContext.Provider, {\n        value: ctx,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_mui_material_styles__WEBPACK_IMPORTED_MODULE_6__.ThemeProvider, {\n            theme: theme,\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_mui_material_CssBaseline__WEBPACK_IMPORTED_MODULE_7__[\"default\"], {}, void 0, false, {\n                    fileName: \"/Users/dariocrucitti/Documents/GitHub/EDM_Espresso_W_FrameWork/pages/_app.tsx\",\n                    lineNumber: 135,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"page-fade\",\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"/Users/dariocrucitti/Documents/GitHub/EDM_Espresso_W_FrameWork/pages/_app.tsx\",\n                        lineNumber: 137,\n                        columnNumber: 11\n                    }, this)\n                }, router.asPath, false, {\n                    fileName: \"/Users/dariocrucitti/Documents/GitHub/EDM_Espresso_W_FrameWork/pages/_app.tsx\",\n                    lineNumber: 136,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/Users/dariocrucitti/Documents/GitHub/EDM_Espresso_W_FrameWork/pages/_app.tsx\",\n            lineNumber: 134,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/dariocrucitti/Documents/GitHub/EDM_Espresso_W_FrameWork/pages/_app.tsx\",\n        lineNumber: 133,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c0QsUUFBUTtnQkFDTlYsUUFBUSxDQUFDVztvQkFDUCxNQUFNQyxPQUFPRCxNQUFNLFNBQVMsVUFBVTtvQkFDdEMsSUFBSTt3QkFBRVQsYUFBYVcsT0FBTyxDQUFDLGtCQUFrQkQ7b0JBQU8sRUFBRSxPQUFNLENBQUM7b0JBQzdELE9BQU9BO2dCQUNUO1lBQ0Y7UUFDRixJQUFJO1FBQUN4RDtLQUFLO0lBRVZULGdEQUFTQSxDQUFDO1FBQ1IsSUFBSSxPQUFPbUUsYUFBYSxhQUFhO1lBQ25DQSxTQUFTQyxlQUFlLENBQUNDLFlBQVksQ0FBQyxjQUFjNUQ7UUFDdEQ7SUFDRixHQUFHO1FBQUNBO0tBQUs7SUFFVCxxQkFDRSw4REFBQ0YsbUVBQWdCQSxDQUFDK0QsUUFBUTtRQUFDQyxPQUFPVDtrQkFDaEMsNEVBQUMxRCwrREFBYUE7WUFBQ3lELE9BQU9BOzs4QkFDcEIsOERBQUN2RCxpRUFBV0E7Ozs7OzhCQUNaLDhEQUFDa0U7b0JBQXdCQyxXQUFVOzhCQUNqQyw0RUFBQ3ZCO3dCQUFXLEdBQUdDLFNBQVM7Ozs7OzttQkFEaEJDLE9BQU9zQixNQUFNOzs7Ozs7Ozs7Ozs7Ozs7O0FBTS9CIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWRtLWJ1aWxkZXIvLi9wYWdlcy9fYXBwLnRzeD8yZmJlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tICduZXh0L2FwcCc7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xuaW1wb3J0ICcuLi9zdHlsZXMvbW9kdWxlLmNzcyc7XG5pbXBvcnQgJ3ByaXNtanMvdGhlbWVzL3ByaXNtLmNzcyc7XG5cbi8vIE1VSSBmb3VuZGF0aW9uIHNldHVwXG5pbXBvcnQgeyBUaGVtZVByb3ZpZGVyLCBjcmVhdGVUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJztcbmltcG9ydCBDc3NCYXNlbGluZSBmcm9tICdAbXVpL21hdGVyaWFsL0Nzc0Jhc2VsaW5lJztcbmltcG9ydCB7IFRoZW1lTW9kZSwgVGhlbWVNb2RlQ29udGV4dCB9IGZyb20gJy4uL2xpYi9UaGVtZU1vZGVDb250ZXh0JztcblxuZnVuY3Rpb24gbWFrZVRoZW1lKG1vZGU6IFRoZW1lTW9kZSkge1xuICBjb25zdCBpc0RhcmsgPSBtb2RlID09PSAnZGFyayc7XG4gIHJldHVybiBjcmVhdGVUaGVtZSh7XG4gICAgcGFsZXR0ZToge1xuICAgICAgbW9kZSxcbiAgICAgIGJhY2tncm91bmQ6IHtcbiAgICAgICAgZGVmYXVsdDogaXNEYXJrID8gJyMwYjBmMTQnIDogJyNmNWY2ZmEnLFxuICAgICAgICBwYXBlcjogaXNEYXJrID8gJyMwZjE0MWEnIDogJyNmZmYnLFxuICAgICAgfSxcbiAgICAgIHByaW1hcnk6IHtcbiAgICAgICAgbWFpbjogJyM3MThlYzAnLFxuICAgICAgICBkYXJrOiAnIzNmNWI4MCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAgdHlwb2dyYXBoeToge1xuICAgICAgZm9udEZhbWlseTogXCInTW9udHNlcnJhdCcsIEFyaWFsLCAnSGVsdmV0aWNhIE5ldWUnLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWZcIixcbiAgICAgIGZvbnRTaXplOiAxMixcbiAgICB9LFxuICAgIHNoYXBlOiB7IGJvcmRlclJhZGl1czogNiB9LFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIE11aUJ1dHRvbjoge1xuICAgICAgICBkZWZhdWx0UHJvcHM6IHsgc2l6ZTogJ21lZGl1bScsIHZhcmlhbnQ6ICdjb250YWluZWQnLCBkaXNhYmxlRWxldmF0aW9uOiB0cnVlIH0sXG4gICAgICAgIHN0eWxlT3ZlcnJpZGVzOiB7XG4gICAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgdGV4dFRyYW5zZm9ybTogJ25vbmUnLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA2LFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tY29sb3ItcHJpbWFyeSknLFxuICAgICAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgICAgICcmOmhvdmVyJzoge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1jb2xvci1wcmltYXJ5LWRhcmspJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBNdWlJY29uQnV0dG9uOiB7XG4gICAgICAgIGRlZmF1bHRQcm9wczogeyBzaXplOiAnc21hbGwnIH0sXG4gICAgICAgIHN0eWxlT3ZlcnJpZGVzOiB7XG4gICAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgcGFkZGluZzogOCxcbiAgICAgICAgICAgIGNvbG9yOiAndmFyKC0taWNvbi1jb2xvciknLFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMgZWFzZSwgYmFja2dyb3VuZC1jb2xvciAwLjJzIGVhc2UnLFxuICAgICAgICAgICAgJyY6aG92ZXInOiB7XG4gICAgICAgICAgICAgIGNvbG9yOiAndmFyKC0taWNvbi1jb2xvci1ob3ZlciknLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1pY29uLWhvdmVyLWJnKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgTXVpU3ZnSWNvbjogeyBkZWZhdWx0UHJvcHM6IHsgZm9udFNpemU6ICdzbWFsbCcsIGNvbG9yOiAnaW5oZXJpdCcgfSB9LFxuICBNdWlUZXh0RmllbGQ6IHsgZGVmYXVsdFByb3BzOiB7IHNpemU6ICdzbWFsbCcsIHZhcmlhbnQ6ICdvdXRsaW5lZCcgfSB9LFxuICBNdWlTZWxlY3Q6IHsgZGVmYXVsdFByb3BzOiB7IHNpemU6ICdzbWFsbCcsIHZhcmlhbnQ6ICdvdXRsaW5lZCcgfSB9LFxuICAgICAgTXVpU2xpZGVyOiB7IGRlZmF1bHRQcm9wczogeyBzaXplOiAnc21hbGwnIH0gfSxcbiAgICAgIE11aU91dGxpbmVkSW5wdXQ6IHsgc3R5bGVPdmVycmlkZXM6IHsgcm9vdDogeyBib3JkZXJSYWRpdXM6IDYgfSB9IH0sXG4gICAgICBNdWlEaWFsb2c6IHtcbiAgICAgICAgc3R5bGVPdmVycmlkZXM6IHtcbiAgICAgICAgICBwYXBlcjoge1xuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAnbm9uZScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGlzRGFyayA/ICcjMTExNjFkJyA6ICcjZmZmJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIE11aVBhcGVyOiB7XG4gICAgICAgIHN0eWxlT3ZlcnJpZGVzOiB7XG4gICAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAnbm9uZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBNdWlBcHBCYXI6IHtcbiAgICAgICAgc3R5bGVPdmVycmlkZXM6IHtcbiAgICAgICAgICByb290OiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGlzRGFyayA/ICcjMGIwZjE0JyA6ICcjRjVGNkZBJyxcbiAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxuICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkJyxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBpc0RhcmsgPyAncmdiYSgyNTUsMjU1LDI1NSwwLjEyKScgOiAncmdiYSgwLDAsMCwwLjEyKSdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgW21vZGUsIHNldE1vZGVdID0gdXNlU3RhdGU8VGhlbWVNb2RlPignbGlnaHQnKTtcblxuICAvLyBJbml0aWFsaXplIGZyb20gbG9jYWxTdG9yYWdlIG9yIHByZWZlcnMtY29sb3Itc2NoZW1lXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2VkbS10aGVtZS1tb2RlJykgYXMgVGhlbWVNb2RlIHwgbnVsbCkgOiBudWxsO1xuICAgICAgaWYgKHNhdmVkID09PSAnbGlnaHQnIHx8IHNhdmVkID09PSAnZGFyaycpIHtcbiAgICAgICAgc2V0TW9kZShzYXZlZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHt9XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5tYXRjaE1lZGlhKSB7XG4gICAgICBjb25zdCBwcmVmZXJzRGFyayA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJykubWF0Y2hlcztcbiAgICAgIHNldE1vZGUocHJlZmVyc0RhcmsgPyAnZGFyaycgOiAnbGlnaHQnKTtcbiAgICB9XG4gIH0sIFtdKTtcblxuICBjb25zdCB0aGVtZSA9IHVzZU1lbW8oKCkgPT4gbWFrZVRoZW1lKG1vZGUpLCBbbW9kZV0pO1xuICBjb25zdCBjdHggPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgbW9kZSxcbiAgICB0b2dnbGU6ICgpID0+IHtcbiAgICAgIHNldE1vZGUoKG0pID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IG0gPT09ICdkYXJrJyA/ICdsaWdodCcgOiAnZGFyayc7XG4gICAgICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdlZG0tdGhlbWUtbW9kZScsIG5leHQpOyB9IGNhdGNoIHt9XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgfSk7XG4gICAgfVxuICB9KSwgW21vZGVdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXRoZW1lJywgbW9kZSk7XG4gICAgfVxuICB9LCBbbW9kZV0pO1xuXG4gIHJldHVybiAoXG4gICAgPFRoZW1lTW9kZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e2N0eH0+XG4gICAgICA8VGhlbWVQcm92aWRlciB0aGVtZT17dGhlbWV9PlxuICAgICAgICA8Q3NzQmFzZWxpbmUgLz5cbiAgICAgICAgPGRpdiBrZXk9e3JvdXRlci5hc1BhdGh9IGNsYXNzTmFtZT1cInBhZ2UtZmFkZVwiPlxuICAgICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1RoZW1lUHJvdmlkZXI+XG4gICAgPC9UaGVtZU1vZGVDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZU1lbW8iLCJ1c2VTdGF0ZSIsInVzZVJvdXRlciIsIlRoZW1lUHJvdmlkZXIiLCJjcmVhdGVUaGVtZSIsIkNzc0Jhc2VsaW5lIiwiVGhlbWVNb2RlQ29udGV4dCIsIm1ha2VUaGVtZSIsIm1vZGUiLCJpc0RhcmsiLCJwYWxldHRlIiwiYmFja2dyb3VuZCIsImRlZmF1bHQiLCJwYXBlciIsInByaW1hcnkiLCJtYWluIiwiZGFyayIsInR5cG9ncmFwaHkiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJzaGFwZSIsImJvcmRlclJhZGl1cyIsImNvbXBvbmVudHMiLCJNdWlCdXR0b24iLCJkZWZhdWx0UHJvcHMiLCJzaXplIiwidmFyaWFudCIsImRpc2FibGVFbGV2YXRpb24iLCJzdHlsZU92ZXJyaWRlcyIsInJvb3QiLCJ0ZXh0VHJhbnNmb3JtIiwiYmFja2dyb3VuZENvbG9yIiwiY29sb3IiLCJNdWlJY29uQnV0dG9uIiwicGFkZGluZyIsInRyYW5zaXRpb24iLCJNdWlTdmdJY29uIiwiTXVpVGV4dEZpZWxkIiwiTXVpU2VsZWN0IiwiTXVpU2xpZGVyIiwiTXVpT3V0bGluZWRJbnB1dCIsIk11aURpYWxvZyIsImJhY2tncm91bmRJbWFnZSIsIk11aVBhcGVyIiwiTXVpQXBwQmFyIiwiYm94U2hhZG93IiwiYm9yZGVyQm90dG9tIiwiYm9yZGVyQ29sb3IiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsInJvdXRlciIsInNldE1vZGUiLCJzYXZlZCIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJ3aW5kb3ciLCJtYXRjaE1lZGlhIiwicHJlZmVyc0RhcmsiLCJtYXRjaGVzIiwidGhlbWUiLCJjdHgiLCJ0b2dnbGUiLCJtIiwibmV4dCIsInNldEl0ZW0iLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInNldEF0dHJpYnV0ZSIsIlByb3ZpZGVyIiwidmFsdWUiLCJkaXYiLCJjbGFzc05hbWUiLCJhc1BhdGgiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "./styles/module.css":
/*!***************************!*\
  !*** ./styles/module.css ***!
  \***************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@mui/material/CssBaseline":
/*!********************************************!*\
  !*** external "@mui/material/CssBaseline" ***!
  \********************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@mui/material/CssBaseline");;

/***/ }),

/***/ "@mui/material/styles":
/*!***************************************!*\
  !*** external "@mui/material/styles" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@mui/material/styles");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/prismjs"], () => (__webpack_exec__("./pages/_app.tsx")));
module.exports = __webpack_exports__;

})();