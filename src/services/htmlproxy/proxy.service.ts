import { HttpService, Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const styles = `<style type="text/css" data-source="User JavaScript and CSS extension">
                #lo-meter-banner-background-color {
                    display: none!important;
                }
                iframe[src^="https://smartlock"], iframe[src^="https://accounts.google"] {
                    display: none!important;
                }
                nav {
                    display: none!important;
                }
          </style>`;

const iframeResizeScriptReceiver = `<script>
            window.addEventListener("message", (event)=> {
                if(event && event.data && event.data.type === 'WINDOW_SIZE') {
                  const frameSelector = 'iframe[src="/' + event.data.locationHref + '"]'
                  const frame = document.querySelector(frameSelector)
                  if(!frame) {
                    console.log('cant find iframe: ' + frameSelector);
                    return;
                  }
                  // sometimes parent have 'padding-top: some%';
                  frame.parentNode.style.padding = 0;
                  frame.style.height = event.data.height +'px'
                  frame.style.position = 'initial'
                }
            })
            </script>`;

const iframeResizeScriptSender = `<script>
        window.parent.postMessage({
            type: 'WINDOW_SIZE',
            height: document.documentElement.offsetHeight,
            locationHref: location.href.slice((location.origin + '/').length),
            len: location.href.length,
        }, "*");
        </script>`;

function appendTo({
  text,
  element,
  data,
}: {
  text: string;
  element: string;
  data: string;
}) {
  const index = text.indexOf(`</${element}>`);

  return `${text.slice(0, index)}${data}${text.slice(index)}`;
}

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  proxyHtml(url: string) {
    return this.httpService
      .get(url)
      .toPromise()
      .then(res => {
        return res.data;
      })
      .then(text => {
        const $ = cheerio.load(text);
        $('head').append(styles);

        $('script').remove();

        $('head').append(iframeResizeScriptReceiver);

        // load images
        $('noscript').each((i, item) => {
          $(item).after($(item).text());
        });

        $('iframe').each((i, item) => {
          $(item).attr('src', `/proxy?url=${$(item).attr('src')}`);
        });

        return $.html();
      });
  }

  proxy(url: string) {
    return fetch(url)
      .then(res => res.text())
      .then((text: string) =>
        appendTo({ text, element: 'body', data: iframeResizeScriptSender }),
      );
  }
}
