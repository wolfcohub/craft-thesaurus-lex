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
}
