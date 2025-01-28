<?php

namespace wolfco\craftthesauruslex;

use Craft;
use craft\base\Model;
use craft\base\Plugin;
use craft\ckeditor\Plugin as CkeditorPlugin;
use craft\events\RegisterUrlRulesEvent;
use craft\events\RegisterComponentTypesEvent;
use craft\services\Utilities;
use wolfco\craftthesauruslex\utilities\Utility;
use yii\base\Event;
use craft\web\UrlManager;
use wolfco\craftthesauruslex\assetbundles\CkeditorThesaurusAsset;

/**
 * Thesaurus Lex plugin
 *
 * @method static ThesaurusLex getInstance()
 * @method Settings getSettings()
 * @author Wolfco <jack@wolfco.us>
 * @copyright Wolfco
 * @license https://craftcms.github.io/license/ Craft License
 */
class ThesaurusLex extends Plugin
{
    public static Plugin $plugin;
    public bool $hasCpSettings = true;
    public string $schemaVersion = '1.0.0';
    protected string $handle = 'thesaurus-lex';

    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Craft::setAlias('@plugins/thesaurus-lex', __DIR__);
        CkeditorPlugin::registerCkeditorPackage(CkeditorThesaurusAsset::class);

        // Register the controller map to ensure it's accessible
        Craft::$app->controllerMap['thesaurus'] = 'wolfco\craftthesauruslex\controllers\ThesaurusController';
        Craft::$app->controllerMap['thesaurus-lex/cache'] = 'wolfco\craftthesauruslex\controllers\CacheController';
        Craft::$app->controllerMap['thesaurus-lex/settings'] = 'wolfco\craftthesauruslex\controllers\SettingsController';
        // Register custom routes
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules = array_merge($event->rules, require __DIR__ . '/config/routes.php');
            }
        );
        // EVENT_REGISTER_UTILITY_TYPES was renamed to EVENT_REGISTER_UTILITIES in Craft 5.0.0
        if (defined('craft\services\Utilities::EVENT_REGISTER_UTILITIES')) {
            Event::on(Utilities::class, Utilities::EVENT_REGISTER_UTILITIES, function (RegisterComponentTypesEvent $event) {
                $event->types[] = Utility::class;
            });
        } elseif (defined('craft\services\Utilities::EVENT_REGISTER_UTILITY_TYPES')) {
            Event::on(Utilities::class, Utilities::EVENT_REGISTER_UTILITY_TYPES, function (RegisterComponentTypesEvent $event) {
                $event->types[] = Utility::class;
            });
        }
    }
    protected function createSettingsModel(): ?Model
    {
        return new \wolfco\craftthesauruslex\models\Settings();
    }

    protected function settingsHtml(): ?string
    {
        return Craft::$app->view->renderTemplate(
            'thesaurus-lex/settings',
            [
                'settings' => $this->getSettings(),  // This ensures the saved settings are loaded
                'version' => $this->schemaVersion,
            ]
        );
    }
}
