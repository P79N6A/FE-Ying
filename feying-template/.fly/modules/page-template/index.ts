import { Atop } from '@byted/atop-app';
import './index.wxml';
import './index.less';

interface IData {}

class Options extends Atop.Page<IData> {
    onReady() {}
}

Page(new Options());
