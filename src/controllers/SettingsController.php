<?php
namespace wolfco\craftthesauruslex\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;

class SettingsController extends Controller
{
    protected array|int|bool $allowAnonymous = false;

    public function actionSaveSettings(): ?Response
    {
        $this->requirePostRequest();
        $plugin = \wolfco\craftthesauruslex\ThesaurusLex::$plugin;

        // Get settings from the POST request
        $settings = Craft::$app->getRequest()->getBodyParam('settings', []);

        // Set the attributes on the settings model
        $plugin->getSettings()->setAttributes($settings, false);

        // Save the settings
        if ($plugin->saveSettings($plugin->getSettings())) {
            Craft::$app->getSession()->setNotice('Settings saved.');
        } else {
            Craft::$app->getSession()->setError('Couldn’t save settings.');
        }

        return $this->redirectToPostedUrl();
    }
    
    public function actionClearCache(): ?Response
    {
        $this->requirePostRequest();

        // Clear all cache keys related to the plugin
        $cache = Craft::$app->getCache();
        $prefix = 'thesaurusLex_'; // Define your cache prefix
        // Assuming you store cache keys separately
        $keys = $cache->get("{$prefix}keys");

        foreach ($keys as $key) {
            $cache->delete($key);
        }

        // Optionally, clear the stored keys
        $cache->delete("{$prefix}keys");

        Craft::$app->getSession()->setNotice('Cache cleared.');

        return $this->redirect('thesaurus-lex/settings');
    }
}
