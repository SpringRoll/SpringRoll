# ColorFilter
ColorFilter is a accessibility testing class.

It has built in support for
```
  protanopia
  protanomaly
  deuteranopia
  deuteranomaly
  tritanopia
  tritanomaly
  achromatopsia
  achromatomaly
```

To use it all you have to do is pass it a element and your desired filter.

```
import { ColorFilter } from './ColorFilter';

const colorFilter = new ColorFilter();

colorFilter.applyFilter(document.getElementById('your-id'), 'protanopia');
```

You can change the filter at any time. using changeFilter();

```
colorFilter.changeFilter('deuteranopia');
```