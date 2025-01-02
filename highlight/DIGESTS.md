## Subresource Integrity

If you are loading Highlight.js via CDN you may wish to use [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to guarantee that you are using a legimitate build of the library.

To do this you simply need to add the `integrity` attribute for each JavaScript file you download via CDN. These digests are used by the browser to confirm the files downloaded have not been modified.

```html
<script
  src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"
  integrity="sha384-pGqTJHE/m20W4oDrfxTVzOutpMhjK3uP/0lReY0Jq/KInpuJSXUnk4WAYbciCLqT"></script>
<!-- including any other grammars you might need to load -->
<script
  src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/languages/go.min.js"
  integrity="sha384-Mtb4EH3R9NMDME1sPQALOYR8KGqwrXAtmc6XGxDd0XaXB23irPKsuET0JjZt5utI"></script>
```

The full list of digests for every file can be found below.

### Digests

```
sha384-qCr0xtEbtIU6E2yKVSftA08wjUBxW2zlHyVvXoQoontrc8eZtFMO/vSWWFtJhpzK /es/languages/latex.js
sha384-Nj46FmS2fPnUrHYhGDrVZjS+SqPPtCVnjiMaPB2WFMnYAWV8lW1T2EQ2gxq8gDs1 /es/languages/latex.min.js
sha384-dllA+pkm+v2eTaDGPSVPCVVy5zE8kkFNxjApnQCXfjf639vbck+YVUTbm5UIlTcr /languages/latex.js
sha384-YnQI+TwzZ1xRk2HJrBDWxf28lhGoOKeLoiMTznB2mX2JDclqH/iuPsQC86Qtwh6X /languages/latex.min.js
sha384-h5G9ppNQFzyrVbMeWbQFtydMTUzFylLJT4cvofXZlj26F0V1wtQ30tvIbTKRlbSg /highlight.js
sha384-3YmJ+OUkv2v0+Uz2i6+HHy0FwTYjxw4nxVJBLx0ngIueNYvf9Dm/8/8XGNS7NY+S /highlight.min.js
```

