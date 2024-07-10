import React, { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { Product } from '../../interfaces/Product';
import {
  getProducts,
  getLatestProducts,
  putFile,
  getFile, 
  postSubscriptions
} from '../../api/httpClient';
import Header from '../main/Header/Header';
import Testimonials from './Testimonials/Testimonials';
import ProductView from './ProductView';
import Partners from './Partners/Partners';
import InnerHTML from 'dangerously-set-html-content';



interface Props {
  preview: boolean;
}
const path = process.env.NODE_ENV === 'production' ? '/home/node/' : '';

const extractVideoUrlParam = (): string | null => {
  const { searchParams } = new URL(window.location.href);
  const videoSrc = searchParams.get('videosrc');
  return videoSrc;
};

export const Marketplace: FC<Props> = (props: Props) => {
  const [products, setProducts] = useState<Array<Product>>([]);
  const [sendFileResult, setSendFileResult] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');


  const [subscriptions, setSubscriptions] = useState<string>('');
  const [subscriptionsResponse, setSubscriptionsResponse] = useState<any>();


  const sendSubscription = (e: FormEvent) => {
    e.preventDefault();

    postSubscriptions(subscriptions).then((data) =>
      setSubscriptionsResponse(data)
    );
  };


 {/* This is for the subscribe event, handling the input value. Vulnerbale to Xss attack 
  
  */}
  const onInput = ({ target }: { target: EventTarget | null }) => {
    const { value } = target as HTMLInputElement;
    setSubscriptions(value);
  };


  const sendFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File = (e.target.files as FileList)[0];
    putFile(`${path}${file.name}`, file).then((result) => {
      setSendFileResult(result);
      setFileName(file.name);
    });
  };

  const onGetFile = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    getFile(`${path}${fileName}`).then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  useEffect(() => {
    props.preview
      ? getLatestProducts().then((data) => setProducts(data))
      : getProducts().then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    const videoElement = document.getElementById('testimonials-video');
    let videoSrc = extractVideoUrlParam();
    videoSrc =
      videoSrc ||
      'https://www.youtube-nocookie.com/embed/MPYlxeG-8_w?controls=0';
    if (videoElement) {
      videoElement.outerHTML = `<iframe width="560" height="315" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ${
        videoSrc && 'src="' + videoSrc
      }"></iframe>`;
    }
  }, []);

  return (
    <section>
      {props.preview || <Header onInnerPage={true} />}

      <section id="marketplace" className="portfolio">
        <div className="container" data-aos="fade-up">

         {/*
          for the XSS attacked subscrbe newsletter
          */}
            <div className="col-lg-4 col-md-6 footer-newsletter mb-5 top-newsletter-xss">
              <h4>Join Our Newsletter</h4>
              <p>
                Join us for news and alerts!
              </p>
              <form className="top-newsletter" onSubmit={sendSubscription}>
                <input
                  type="input"
                  name="input"
                  value={subscriptions}
                  onInput={onInput}
                />
                <input type="submit" value="Subscribe" />
              </form>
              {subscriptionsResponse && (
                <div className="dangerous-html">
                  <InnerHTML html={subscriptionsResponse + ' subscribed.'} />
                </div>
              )}
            </div>
                  

          <div className="section-title marketplaceTitle">
            <h2>Marketplace</h2>
          </div>
          {props.preview || (
            <div className="row">
              <div className="col-lg-12 d-flex justify-content-center">
                <ul id="portfolio-flters">
                  <li data-filter="*" className="filter-active">
                    All
                  </li>
                  <li data-filter=".filter-Healing">Healing</li>
                  <li data-filter=".filter-Jewellery">Jewellery</li>
                  <li data-filter=".filter-Gemstones">Gemstones</li>
                </ul>
              </div>
            </div>
          )}
          <div className="row portfolio-container">
            {products &&
              products.map((product, i) => (
                <ProductView product={product} key={i} />
              ))}
          </div>
        </div>
        {props.preview && (
          <div className="section-readmore">
            <a href="/marketplace">
              <span>See all products</span>
            </a>
          </div>
        )}
      </section>
      <Partners />
      <Testimonials preview={props.preview} />
      <section id="feedback" className="testimonials section-bg">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h2>Upload Files</h2>
            <span>Please, upload a feedback: </span>
            <span>Supported files: PDF, PNG, JPEG</span>
            <label htmlFor="feedback-file-input" className="file-input-label">
              
            </label>

          
            <button
                className="upload-file-button"
              >Upload files here.</button>
            <input
              id="feedback-file-input"
              type="file"
              className= "file-input-hidden-button"
              accept="file/*"
              style={{ display: 'none' }}
              onChange={sendFile}
            />
            {sendFileResult.length > 0 && (
              <>
                <div className="warning-text">{sendFileResult}</div>
                <div>
                  
                  <a href="#" onClick={onGetFile}>
                  Find you file
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      {props.preview || (
        <section id="video" className="testimonials section-bg">
          <div
            className="container d-flex justify-content-center"
            data-aos="fade-up"
          >
            <iframe
              width="560"
              height="315"
              id="testimonials-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
        </section>
      )}
    </section>
  );
};

export default Marketplace;
