// ==UserScript==
// @name         Zurl-helper: 短链助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Zurl短链接助手：通过油猴菜单手动弹窗，为任意链接生成短链接，拥有人性化的UI和精确的响应处理，并自动适配夜间模式。
// @author       qiquqiu
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // --- 配置菜单 ---
    GM_registerMenuCommand('设置 Zurl 服务地址', () => {
        let zurlApiUrl = prompt('请输入您的 Zurl 服务地址 (例如: https://link.qiquqiu.xyz)', GM_getValue('zurlApiUrl', ''));
        if (zurlApiUrl) {
            zurlApiUrl = zurlApiUrl.trim();
            if (!zurlApiUrl.startsWith('http://') && !zurlApiUrl.startsWith('https://')) {
                zurlApiUrl = 'http://' + zurlApiUrl;
            }
            if (zurlApiUrl.endsWith('/')) {
                zurlApiUrl = zurlApiUrl.slice(0, -1);
            }
            GM_setValue('zurlApiUrl', zurlApiUrl);
            alert('Zurl 服务地址已保存为：' + zurlApiUrl);
        }
    });

    GM_registerMenuCommand('设置 API Key', () => {
        const apiKey = prompt('请输入您的 Zurl API Key (例如: sk-xxxxxxxx)', GM_getValue('apiKey', ''));
        if (apiKey) {
            GM_setValue('apiKey', apiKey.trim());
            alert('API Key 已保存！');
        }
    });

    GM_registerMenuCommand('手动生成短链接', showManualShortenModal);

    // --- UI 弹窗 ---
    function showManualShortenModal() {
        const zurlApiUrl = GM_getValue('zurlApiUrl');
        const apiKey = GM_getValue('apiKey');

        if (!zurlApiUrl || !apiKey) {
            alert('请先通过油猴菜单设置 Zurl 服务地址和 API Key！');
            return;
        }

        if (document.getElementById('zurl-modal-overlay-final')) {
            return;
        }

        const modalHtml = `
            <style>
                /* --- 默认浅色模式样式 --- */
                .zurl-modal-container * { box-sizing: border-box; }
                .zurl-modal-content {
                    background: #fdfdfd; padding: 25px 30px; border-radius: 12px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.15); width: 520px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    border: 1px solid #e0e0e0;
                }
                .zurl-modal-header { margin-top: 0; margin-bottom: 25px; color: #333; font-size: 22px; font-weight: 600; }
                .zurl-form-group { margin-bottom: 18px; }
                .zurl-label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #555; }
                .zurl-input {
                    width: 100%; padding: 9px 12px; border: 1px solid #ccc; border-radius: 6px;
                    font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; background-color: #fff; color: #212529;
                }
                .zurl-input:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2); outline: none; }
                .zurl-result-wrapper { display: flex; align-items: stretch; }
                .zurl-result-wrapper .zurl-input { border-top-right-radius: 0; border-bottom-right-radius: 0; background: #e9ecef; }
                .zurl-btn {
                    border: none; border-radius: 6px; cursor: pointer;
                    font-size: 15px; font-weight: 500; transition: background-color 0.2s, transform 0.1s, filter 0.2s;
                    display: inline-flex; align-items: center; justify-content: center;
                }
                .zurl-btn:active { transform: scale(0.98); }
                .zurl-btn-primary { background: #007bff; color: white; padding: 9px 15px; }
                .zurl-btn-primary:hover { background: #0056b3; }
                .zurl-btn-secondary { background: #6c757d; color: white; margin-left: 10px; padding: 9px 15px; }
                .zurl-btn-secondary:hover { background: #5a6268; }
                .zurl-btn-copy { border-top-left-radius: 0; border-bottom-left-radius: 0; padding: 0 14px; flex-shrink: 0; }
                .zurl-btn-copy:hover { filter: brightness(1.1); }
                .zurl-footer { text-align: right; margin-top: 25px; }
                .zurl-status { font-size: 14px; min-height: 20px; text-align: left; }

                /* --- 夜间模式 (Dark Mode) 样式 --- */
                @media (prefers-color-scheme: dark) {
                    .zurl-modal-content {
                        background-color: #2b2b2b;
                        border-color: #444;
                    }
                    .zurl-modal-header, .zurl-label {
                        color: #e0e0e0;
                    }
                    .zurl-input {
                        background-color: #3c3c3c;
                        color: #f0f0f0;
                        border-color: #666;
                    }
                    .zurl-input::placeholder {
                        color: #888;
                    }
                    .zurl-result-wrapper .zurl-input {
                        background-color: #222;
                    }
                    .zurl-btn-secondary {
                        background-color: #555;
                        color: #fff;
                    }
                    .zurl-btn-secondary:hover {
                        background-color: #666;
                    }
                }
            </style>
            <div id="zurl-modal-overlay-final" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 2147483647; display: flex; align-items: center; justify-content: center;">
                <div class="zurl-modal-container">
                    <div class="zurl-modal-content">
                        <h3 class="zurl-modal-header">生成 Zurl 短链接</h3>
                        <div class="zurl-form-group">
                            <label for="long_url_input" class="zurl-label">长链接:</label>
                            <input type="text" id="long_url_input" class="zurl-input" placeholder="请在此粘贴或输入需要缩短的完整链接">
                        </div>
                        <div class="zurl-form-group">
                            <label for="ttl_days" class="zurl-label">有效期 (天):</label>
                            <input type="number" id="ttl_days" class="zurl-input" placeholder="留空则永不过期" min="0">
                        </div>
                        <div class="zurl-form-group">
                            <label for="short_url" class="zurl-label">自定义短链接 (可选):</label>
                            <input type="text" id="short_url" class="zurl-input" placeholder="留空则自动生成">
                        </div>
                        <div id="zurl-result-container" style="display: none;" class="zurl-form-group">
                             <label class="zurl-label">生成结果:</label>
                             <div class="zurl-result-wrapper">
                                 <input type="text" id="zurl-result-input" class="zurl-input" readonly>
                                 <button id="zurl-copy-btn" class="zurl-btn zurl-btn-primary zurl-btn-copy">复制</button>
                             </div>
                        </div>
                        <p id="zurl-status" class="zurl-status"></p>
                        <div class="zurl-footer">
                            <button id="zurl-cancel-btn" class="zurl-btn zurl-btn-secondary">取消</button>
                            <button id="zurl-submit-btn" class="zurl-btn zurl-btn-primary">生成</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        document.getElementById('long_url_input').value = window.location.href;

        const overlay = document.getElementById('zurl-modal-overlay-final');
        const cancelButton = document.getElementById('zurl-cancel-btn');
        const submitButton = document.getElementById('zurl-submit-btn');
        const copyButton = document.getElementById('zurl-copy-btn');
        const resultInput = document.getElementById('zurl-result-input');
        const statusText = document.getElementById('zurl-status');

        const closeModal = () => { document.body.removeChild(modalContainer); };

        overlay.addEventListener('click', (e) => { if (e.target === overlay) { closeModal(); } });
        cancelButton.addEventListener('click', closeModal);

        copyButton.addEventListener('click', () => {
            resultInput.select();
            document.execCommand('copy');
            copyButton.textContent = '已复制!';
            setTimeout(() => { copyButton.textContent = '复制'; }, 2000);
        });

        submitButton.addEventListener('click', () => {
            const longUrl = document.getElementById('long_url_input').value.trim();
            if (!longUrl) {
                statusText.textContent = '错误: 长链接不能为空！';
                statusText.style.color = '#dc3545';
                return;
            }

            const ttlDaysValue = document.getElementById('ttl_days').value.trim();
            const short_url = document.getElementById('short_url').value.trim();
            const requestBody = { long_url: longUrl };

            if (short_url) {
                requestBody.short_url = short_url;
            }
            if (ttlDaysValue !== '') {
                requestBody.ttl_days = parseInt(ttlDaysValue, 10) || 0;
            }
            
            // 适配夜间模式的“生成中”文字颜色
            const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            statusText.textContent = '生成中...';
            statusText.style.color = isDarkMode ? '#999' : '#6c757d';
            submitButton.disabled = true;

            GM_xmlhttpRequest({
                method: "POST",
                url: `${zurlApiUrl}/api/shorten_url`,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                data: JSON.stringify(requestBody),
                onload: function(response) {
                    submitButton.disabled = false;
                    statusText.textContent = '';
                    try {
                        const result = JSON.parse(response.responseText);
                        if (response.status === 200 && result.code === 200 && result.data && result.data.short_url) {
                            const finalUrl = `${zurlApiUrl}/${result.data.short_url}`;
                            document.getElementById('zurl-result-container').style.display = 'block';
                            resultInput.value = finalUrl;
                            statusText.style.color = '#28a745'; // 绿色在两种模式下都清晰
                            statusText.textContent = '生成成功！';
                        } else {
                            statusText.style.color = '#dc3545'; // 红色在两种模式下都清晰
                            statusText.textContent = `错误: ${result.msg || result.message || '未知API错误'}`;
                        }
                    } catch (e) {
                        statusText.style.color = '#dc3545';
                        statusText.textContent = `请求失败 (${response.status}): ${response.statusText}`;
                    }
                },
                onerror: function(error) {
                    submitButton.disabled = false;
                    statusText.style.color = '#dc3545';
                    statusText.textContent = `网络错误: ${error.statusText || '无法连接到服务'}`;
                }
            });
        });
    }
})();