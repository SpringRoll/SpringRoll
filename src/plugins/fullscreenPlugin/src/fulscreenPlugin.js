/* eslint-disable indent */
import { ApplicationPlugin } from '../../ApplicationPlugin';

/**
 * A Springroll plugin to easily set up togglable fullscreen
 */
export default class FullScreenPlugin extends ApplicationPlugin {

    
    /**
     *  Creates an instance of FullscreenPlugin
     * 
     * @param {string} targetElementSelector -The selector for the element to make fullscreen
     */
    constructor (targetElementSelector, buttonSelector) {
        super ({ name: 'fullscreen' });

        this.toggleButton = document.querySelector(buttonSelector);

        this.targetElementSelector = targetElementSelector;
        this.buttonSelector = buttonSelector;
        
        this.toggleButton.addEventListener('click', () => this.toggleFullscreen());
        
    }

    

    /**
     * 
     */
    toggleFullscreen() {
        const element = document.querySelector(this.targetElement);

        if (!document.fullscreenElement) {
            element.requestFullscreen().then(() => {

            }).catch(() => {

            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * 
     * @param {*} param0 
     */
    preload({ client }) {
        this.client = client;
        return Promise.resolve();
    }
    
}