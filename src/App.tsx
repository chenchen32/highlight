import React from 'react';
import Search, {SearchOptions} from "./lib/search";
import './App.css';

let searchIns: Search | null

function App() {
    const [keyword, setKeyword] = React.useState<string>('');
    const ref = React.useRef<HTMLDivElement>(null);
    const wrapRef = React.useRef<HTMLDivElement>(null);
    const [text, setText] = React.useState<string>(``);
    const [visible, setVisible] = React.useState<boolean>(false)
    const onChange = (e: any) => {
        setKeyword(e.target.value)
    }
    const handleSearch = () => {
        searchIns?.search(keyword)
        // highlightIns.mark(keyword, {
        //     acrossElements: true,
        // })
    }
    const handleSave = () => {
        if (ref.current) {
            console.log('save content', ref.current.innerHTML)
        }
    }

    const handleRefresh = () => {
        setText('good job')
        setVisible(visible => !visible);
    }

    React.useEffect(() => {
        if (ref.current && wrapRef.current && !searchIns) {
            const options: SearchOptions = {
                detailElement: ref.current,
                wrapElementId: "id-detail",
                wrapElement: wrapRef.current,
            }
            searchIns = new Search(options)
        }

        return () => {
            if (searchIns) {
                searchIns.dispose();
                searchIns = null;
            }
        }
    }, [])

    return (
        <div className="App">
            <div className="search-head">
                <input type="text" value={keyword} onChange={onChange}/>
                <button onClick={handleSearch}>搜索</button>
                <button onClick={handleSave}>保存</button>
                <button onClick={handleRefresh}>刷新</button>
            </div>
            <div className="box">
                <div className="detail" id="id-detail" ref={wrapRef}>
                    {visible ? <div>change visible element</div> : null}
                    <div ref={ref} className="detail-inner">
                        <h1>定风波·莫听穿林打叶声</h1>
                        <div className="contson">
                            <p>三月七日，沙湖道中遇雨，雨具先去，同行皆狼狈，余独不觉。已而遂晴，故作此(词)。</p>
                            <p>莫听穿林打叶声，何妨吟啸且徐行。竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。<br/>料峭春风吹酒醒，微冷，山头斜照却相迎。回首向来萧瑟处，归去，也无风雨也无晴。
                            </p>
                        </div>
                        <div
                            className="contyishang"
                            style={{width: 600, height: 300, overflow: 'auto', border: '1px solid lightblue'}}
                        >
                            <div style={{height: 30, fontWeight: 'bold', fontSize: 16, marginBottom: 10}}>
                                <h2><span>译文及注释</span></h2>
                            </div>
                            <p>
                                <strong>译文</strong><br/><span>宋神宗元丰五年（1082）的三月七日，在沙湖道上赶上了下雨，有人带着雨具先走了，同行的人都觉得很狼狈，只有我不这么觉得。过了一会儿天晴了，就做了这首词。</span>
                            </p>
                            <p>不用注意那穿林打叶的雨声，何妨放开喉咙吟咏长啸从容而行。拄竹杖、穿芒鞋，走得比骑马还轻便，一身蓑衣任凭风吹雨打，照样过我的一生！<br/>春风微凉吹醒我的酒意，微微有些冷，山头初晴的斜阳却应时相迎。回头望一眼走过来的风雨萧瑟的地方，我信步归去，不管它是风雨还是放晴。
                            </p>
                            <p><strong>注释</strong><br/>定风波：词牌名。<br/>沙湖：在今湖北黄冈东南三十里，又名螺丝店。<br/>狼狈：进退皆难的困顿窘迫之状。<br/>已而：过了一会儿。<br/>穿林打叶声：指大雨点透过树林打在树叶上的声音。<br/>吟啸：吟咏长啸。<br/>芒鞋：草鞋。<br/>一蓑烟雨任平生：披着蓑衣在风雨里过一辈子也处之泰然。一蓑（suō）：蓑衣，用棕制成的雨披。<br/>料峭：微寒的样子。<br/>斜照：偏西的阳光。<br/>向来：方才。萧瑟：风雨吹打树叶声。<br/>也无风雨也无晴：意谓既不怕雨，也不喜晴。
                            </p>
                        </div>
                    </div>
                    <div className="search-highlight-container"></div>
                </div>
            </div>
        </div>
    );
}

export default App;
