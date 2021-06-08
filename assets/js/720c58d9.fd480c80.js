(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[48],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return l},kt:function(){return m}});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},l=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),d=c(n),m=a,h=d["".concat(p,".").concat(m)]||d[m]||u[m]||o;return n?r.createElement(h,i(i({ref:t},l),{},{components:n})):r.createElement(h,i({ref:t},l))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s.mdxType="string"==typeof e?e:a,i[1]=s;for(var c=2;c<o;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1346:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return s},metadata:function(){return p},toc:function(){return c},default:function(){return u}});var r=n(2122),a=n(9756),o=(n(7294),n(3905)),i=["components"],s={id:"quick_start",title:"Quick Start",sidebar_label:"Quick Start",slug:"/"},p={unversionedId:"getting_started/quick_start",id:"getting_started/quick_start",isDocsHomePage:!1,title:"Quick Start",description:"Installation",source:"@site/docs/getting_started/quick_start.md",sourceDirName:"getting_started",slug:"/",permalink:"/overreact-core/",editUrl:"https://github.com/microsoft/overreact-core/packages/website/edit/master/website/docs/getting_started/quick_start.md",version:"current",lastUpdatedBy:"Markel Madina Olalde",lastUpdatedAt:1623105005,formattedLastUpdatedAt:"6/7/2021",sidebar_label:"Quick Start",frontMatter:{id:"quick_start",title:"Quick Start",sidebar_label:"Quick Start",slug:"/"},sidebar:"someSidebar",next:{title:"Mutating Data",permalink:"/overreact-core/getting_started/mutation"}},c=[{value:"Installation",id:"installation",children:[]},{value:"Setup your app",id:"setup-your-app",children:[{value:"Configure your network requestor",id:"configure-your-network-requestor",children:[]},{value:"Configure a schema",id:"configure-a-schema",children:[]},{value:"Initialize a DataFetcher",id:"initialize-a-datafetcher",children:[]}]},{value:"Create data specs",id:"create-data-specs",children:[]},{value:"Create your first overreact UI component",id:"create-your-first-overreact-ui-component",children:[]},{value:"What&#39;s Next?",id:"whats-next",children:[]}],l={toc:c};function u(e){var t=e.components,n=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,r.Z)({},l,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"installation"},"Installation"),(0,o.kt)("p",null,"Install overreact using ",(0,o.kt)("inlineCode",{parentName:"p"},"yarn")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"npm"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"yarn add @bingads-webui/overreact\n")),(0,o.kt)("h2",{id:"setup-your-app"},"Setup your app"),(0,o.kt)("p",null,"In this guide, we're going to build an app that talks with the infamous ",(0,o.kt)("a",{parentName:"p",href:"https://www.odata.org/getting-started/understand-odata-in-6-steps/"},"TripPin")," service, which exposes a typical OData endpoint at ",(0,o.kt)("inlineCode",{parentName:"p"},"https://services.odata.org/v4/TripPinServiceRW")),(0,o.kt)("h3",{id:"configure-your-network-requestor"},"Configure your network requestor"),(0,o.kt)("p",null,"overreact doesn't explicitly use any specific API to issue network requests (",(0,o.kt)("inlineCode",{parentName:"p"},"$.ajax"),", ",(0,o.kt)("inlineCode",{parentName:"p"},"fetch"),", etc.), instead, it allows you to customize how your application wants to make requests to the network. In our app, we'll go with the ",(0,o.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"},(0,o.kt)("inlineCode",{parentName:"a"},"fetch")," API"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="network-requestor.js"',title:'"network-requestor.js"'},"export function networkRequestor(uri, requestVerb, headers, body) {\n    const endpoint = 'https://services.odata.org/v4/TripPinServiceRW';\n    const requestUrl = `${endpoint}${uri}`;\n\n    return fetch(requestUrl, {\n        method: requestVerb,\n        headers,\n        body: JSON.stringify(body),\n    }).then(response => response.json());\n}\n")),(0,o.kt)("h3",{id:"configure-a-schema"},"Configure a schema"),(0,o.kt)("p",null,"A ",(0,o.kt)("a",{parentName:"p",href:"/concept/schema"},"schema")," describes what entities are available and what name (alias) your app should call those entities internally."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="schema.js"',title:'"schema.js"'},"import { Schema } from '@bingads-webui/overreact';\n\nconst schemaToModelMapping = {\n    people: 'People',\n    trip: 'Trip',\n    airline: 'Airline',\n    // more entities go here ...\n};\n\nexport const schema = new Schema(schemaToModelMapping, () => {});\n")),(0,o.kt)("h3",{id:"initialize-a-datafetcher"},"Initialize a DataFetcher"),(0,o.kt)("p",null,"Now let's initalize overreact to run in your app. To do that, simply put a ",(0,o.kt)("inlineCode",{parentName:"p"},"DataFetcher")," component in your app, and have it wrap all UI components that requires data operations:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="app.js"',title:'"app.js"'},"import React from 'react';\nimport { \n    DataFetcher,\n    Environment,\n    Store,\n} from '@bingads-webui/overreact';\n\n// Previously defined schema and network requestor\nimport { networkRequestor } from './network-requestor';\nimport { schema } from './schema';\n\n// React component that will talk to the TripPin service\nimport { PeopleContainer } from './people-container';\n\nexport default function App() {\n    // define an Environment object to configure overreact\n    const store = new Store();\n    const tripPinEnvironment = new Environment(networkRequestor, schema, store, []);\n\n    return (\n        <div className=\"app-container\">\n            <DataFetcher environment={tripPinEnvironment}>\n                <PeopleContainer userName=\"russellwhyte\" />\n            </DataFetcher>\n        </div>\n    );\n}\n")),(0,o.kt)("p",null,"Now that overreact has now been initialized, we need to tell overreact how to construct actual network requests for different entities, and how to store them locally."),(0,o.kt)("h2",{id:"create-data-specs"},"Create data specs"),(0,o.kt)("p",null,"In our app, we'll look for a specific ",(0,o.kt)("inlineCode",{parentName:"p"},"People"),' entity, whose name is "russellwhyte", from the TripPin service. To do that, let\'s create a data spec for ',(0,o.kt)("inlineCode",{parentName:"p"},"People"),". This spec allows overreact to issue a HTTP GET call, like this:"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"GET ",(0,o.kt)("a",{parentName:"p",href:"https://services.odata.org/v4/TripPinServiceRW/People('russellwhyte')"},"https://services.odata.org/v4/TripPinServiceRW/People('russellwhyte')")," HTTP/1.1")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="people-spec.js"',title:'"people-spec.js"'},"import {\n    createRequestContract,\n    createResponseContract,\n    createSpec,\n\n    requestVerbs,\n    responseTypes,\n    specTypes,\n} from '@bingads-webui/overreact';\n\nimport { schema } from './schema';\n\nfunction odataUriFactory(params) {\n    const { variables } = params;\n    const { locator } = variables;\n    const { descriptor, order } = locator;\n    const { userName } = descriptor;\n\n    return `/People(${userName})`;\n}\n\nconst odataHeaderFactory = () => {};\n\nconst requestContract = createRequestContract({\n    schema,\n    dataPath: 'people',\n    verb: requestVerbs.GET,\n    uriFactoryFn: odataUriFactory,\n    headerFactoryFn: odataHeaderFactory,\n    keySelector: p => p.UserName,\n});\n\nconst responseContract = createResponseContract({\n    requestContract: requestContract,\n    responseType: responseTypes.ENTITY,\n    keySelector: p => p.UserName,\n});\n\nexport const peopleSpec = \n    createSpec(requestContract, responseContract, specTypes.FETCH, null);\n\n")),(0,o.kt)("p",null,"Finally, let's construct a React component that consumes the data."),(0,o.kt)("h2",{id:"create-your-first-overreact-ui-component"},"Create your first overreact UI component"),(0,o.kt)("p",null,"By now, we have all the required pieces ready to make the actual network call. Let's assume our app contains two text field, showing a user's name and address from the TripPin service."),(0,o.kt)("p",null,"We begin by issuing the call using the ",(0,o.kt)("inlineCode",{parentName:"p"},"useFetch")," hook from overreact."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="people-container.js"',title:'"people-container.js"'},"import React, { useMemo } from 'react';\nimport { \n    useFetch,\n    useDataRefId,\n} from '@bingads-webui/overreact';\n\nimport { peopleSpec } from './people-spec';\nimport { PeopleView } from './people-view';\n\nexport function PeopleContainer(props) {\n    const { userName } = props;\n    const dataRefId = useDataRefId();\n\n    const variables = useMemo(() => ({\n        locator: {\n            descriptor: { people: userName },\n            order: ['people'],\n        },\n    }), [userName]);\n\n    const [data] = useFetch(dataRefId, peopleSpec, variables);\n\n    return (data && <PeopleView \n        firstName={data.FirstName}\n        lastName={data.LastName}\n        address={data.AddressInfo[0]}\n    >);\n}\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx",metastring:'title="people-view.js"',title:'"people-view.js"'},"import React from 'react';\n\nexport function PeopleView(props) {\n    const { firstName, lastName, address } = props;\n    const { Address } = address;\n\n    return (\n        <div className=\"people-view\">\n            <span>{`${firstName} ${lastName}`}</span>\n            <span>{Address}</span>\n        </div>\n    );\n}\n")),(0,o.kt)("p",null,"That's it! Run your app and you should see a network request going out to ",(0,o.kt)("inlineCode",{parentName:"p"},"https://services.odata.org/v4/(S(wzb13shf21muw3is3clriogh))/TripPinServiceRW/People('russellwhyte')")," (the actual URL listening to the requests), and the response should be rendered on the page."),(0,o.kt)("h2",{id:"whats-next"},"What's Next?"),(0,o.kt)("p",null,"overreact does more than just fetching data from network. It also provides rich support for the following scenarios:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/getting_started/mutation"},"Data mutation")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/getting_started/pagination"},"Pagination")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/getting_started/middleware"},"Adding middleware")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/getting_started/error"},"Handling errors"))),(0,o.kt)("p",null,"You can click on each topic to learn more details. Additionally, please go to ",(0,o.kt)("a",{parentName:"p",href:"/concept/data_structure"},"Data Structure")," section to learn about how overreact stores data internally."))}u.isMDXComponent=!0}}]);